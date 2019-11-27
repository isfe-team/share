----------------------------------------------------------------------------
-- $Id: sign.lua, v 0.1 2015/09/17 bqliu$
-- $ if want to print/io.write debug message, cancel the comment symbols $
----------------------------------------------------------------------------

require("alien")
-- local io = require("io")
-- print("alien loadded")
local core = alien.load("sign/MakeSignature")
-- print(core)

module ("sign")

----------------------------------------------------------------------------
-- a direct call to do all the things
-- @param private_key_file_path -- the path of the key file and is judged
--			in host program so if not exist the function wonnot be called
-- @param params -- string needs to be encrypted
----------------------------------------------------------------------------

function make_sign(private_key_file_path, params)

	-- io.write("in make_sign functions, the params passed is: ", params)
	core.GetSignature:types("string", "string", "string")
	local ret = core.GetSignature(private_key_file_path, params)
	-- io.write("in sign.lua ret is " .. ret)

	core = nil

	return ret
end