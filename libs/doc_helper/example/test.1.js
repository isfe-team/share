const context = new AudioContext({
  sampleRate: 8000
})

/**
* 
 * @param {DataView} data
* @param {number} offset
* @param {string} str
*/
function writeString (data, offset, str) {
  for (let i = 0; i < str.length; ++i) {
    data.setUint8(offset + i, str.charCodeAt(i))
  }
}

function strToArrayBuffer (str) {
  return new Uint8Array(str.length).map((_, i) => str.charCodeAt(i))
}

function u32ToArrayBuffer (number) {
  return numberToArrayBuffer(number, 32)
}

function u16ToArrayBuffer (number) {
  return numberToArrayBuffer(number, 16)
}

function numberToArrayBuffer (number, byteSize) {
  const size = byteSize / 8
  const buffer = new Uint8Array(size)
  for (let i = 0; i < size; ++i) {
    buffer[i] = (number >> (i * 8)) & 0xFF
  }
  return buffer
}

/**
* 
 * @param {Uint8Array} uint8Array 
 * @param {number} sampleRate 
 * @param {number} channelCount 
 * @param {number} byteBits 
 */
function pcm2wavRaw (uint8Array, sampleRate, channelCount, byteBits) {
  const wavLength = uint8Array.byteLength + 44
  const wav = new Uint8Array(wavLength)
  const chunkId = 'RIFF'
  const format = 'WAVE'
  const subChunkId1 = 'fmt '
  const subChunkId2 = 'data'
  wav.set(strToArrayBuffer(chunkId), 0)
  wav.set(u32ToArrayBuffer(wavLength - 8), 4)
  wav.set(strToArrayBuffer(format), 8)
  wav.set(strToArrayBuffer(subChunkId1), 12)
  wav.set(u32ToArrayBuffer(16), 16)
  wav.set(u16ToArrayBuffer(1), 20)
  wav.set(u16ToArrayBuffer(channelCount), 22)
  wav.set(u32ToArrayBuffer(sampleRate), 24)
  wav.set(u32ToArrayBuffer(sampleRate * byteBits * channelCount / 8), 28)
  wav.set(u16ToArrayBuffer(channelCount * byteBits / 8), 32)
  wav.set(u16ToArrayBuffer(byteBits), 34)
  wav.set(strToArrayBuffer(subChunkId2), 36)
  wav.set(u32ToArrayBuffer(wavLength - 44), 40)
  wav.set(uint8Array, 44)

  return wav
}

/**
* 
 * @param {DataView} bytes 
 * @param {number} inputSampleRate 
 * @param {number} outputSampleRate 
 * @param {number} channelCount 
 * @param {number} outputSampleBits
* @returns {DataView} 
 */
function pcm2wav (bytes, inputSampleRate, outputSampleRate, channelCount, outputSampleBits) {
  const sampleRate = Math.min(inputSampleRate, outputSampleRate)
  const sampleBits = outputSampleBits
  const byteLength = bytes.byteLength
  const buffer = new ArrayBuffer(44 + byteLength)
  const data = new DataView(buffer)
  let offset = 0

  writeString(data, offset, 'RIFF')
  offset += 4
  data.setUint32(offset, 36 + byteLength, true)
  offset += 4
  writeString(data, offset, 'WAVE')
  offset += 4
  writeString(data, offset, 'fmt ')
  offset += 4
  data.setUint32(offset, 16, true)
  offset += 4
  data.setUint16(offset, 1, true)
  offset += 2
  data.setUint16(offset, channelCount, true)
  offset += 2
  data.setUint32(offset, sampleRate, true)
  offset += 4
  data.setUint32(offset, channelCount * sampleRate * (sampleBits / 8), true)
  offset += 4
  data.setUint16(offset, channelCount * (sampleBits / 8), true)
  offset += 2
  data.setUint16(offset, sampleBits, true)

  offset += 2
  writeString(data, offset, 'data')
  offset += 4
  data.setUint32(offset, byteLength, true)
  offset += 4
  for (let i = 0; i < byteLength; ++i) {
    data.setUint8(offset, bytes.getUint8(i))
    ++offset
  }

  return data
}

/**
* 
 * @param {AudioContext} context 
 * @param {ArrayBuffer} rawBuffer 
 */
function decode (context, rawBuffer) {
  return context.decodeAudioData(rawBuffer)
}

/**
* 
 * @param {AudioContext} context 
 * @param {AudioBuffer} audioBuffer 
 */
function createSource (context, audioBuffer) {
  const source = context.createBufferSource()
  source.buffer = audioBuffer
  const gainNode = context.createGain()
  source.connect(gainNode)
  gainNode.connect(context.destination)
  gainNode.gain.value = 0.5

  return {
    source,
    gainNode
  }
}

document.querySelector('#audio_selector').addEventListener('change', (evt) => {
  const file = evt.target.files[0]
  evt.target.value = null
  const fr = new FileReader()
  fr.readAsArrayBuffer(file)
  fr.addEventListener('error', (evt) => {
    console.error('error:', evt)
  })
  fr.addEventListener('loadend', () => {
    const uint8Array = new Uint8Array(fr.result.byteLength * 2)
    uint8Array.set(new Uint8Array(fr.result), 0)
    uint8Array.set(new Uint8Array(fr.result), fr.result.byteLength)
    const dataView = pcm2wav(
      new DataView(uint8Array.buffer),
      context.sampleRate,
      context.sampleRate,
      1, // context.destination.channelCount,
      16
    )
    console.time('decode')
    decode(context, dataView.buffer)
    // const newAudioBuffer = pcm2wavRaw(uint8Array, context.sampleRate, 1, 16)
    // decode(context, newAudioBuffer.buffer)
      .then((audioBuffer) => {
        console.timeEnd('decode')
        console.log('audioBuffer:', audioBuffer)
        // { duration | length | numberOfChannels | sampleRate }
        const { source, gainNode } = createSource(context, audioBuffer)
        window.x = source
        window.y = gainNode
        source.start(0)
        source.addEventListener('ended', () => {
          context.suspend()
        })
      }, (err) => {
        console.error('err:', err)
      })
  })
})
