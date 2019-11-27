----------------------------------------------------------------------------
-- $Id: sign.lua,v 0.1 2015/09/17 bqliu$
-- @param params -- need to be encrypted
----------------------------------------------------------------------------

do
	local x = require("sign")
	-- print("sign loadded", x)

--[[ check the contents of the table x
	for k, v in pairs(x) do
		print(k, v)
	end
]]--

	function makesign(params)
		-- private_key_file_path: the value of it should be set according to the path of the file
		local private_key_file_path = "./rsa_private_key_iflytek.pem"

		-- print("private_key_file_path: ", private_key_file_path)
		-- print("params: ", params)
		-- test whether the file exists
		local key_file = io.open(private_key_file_path, "r")
		if key_file == nil then
			print ("file not exist or cannot read")
			return "bad key file"
		end
		-- print ("file find")
		-- donnot forget close
		key_file:close()
		key_file = nil

		-- encrypt the params using the private_key_file
		local ret = sign.make_sign(private_key_file_path, params)
		-- print ("the sign made is: ", ret)

		private_key_file = nil

		return ret
	end

	local sign = makesign('dafsafd')
	print("sign: ", sign)

--[[ output the contents to test.txt and check
	local code = { }
	code.a = "http://sfadfda/fdasfdas/fdsa/fdsa/fdsasdfwseo 我二维码暗室逢灯那"
	code.b = "http://book.luaer.cn/_119.htm"
	code.c = "http://alien.luaforge.net/"
	code.d = "http://www.cplusplus.com/reference/future/packaged_task/"
	code.e = "dsfafa hs fsda jsadlk jdsafk dsfa "
	code.f = "fdasf jasdof jaslk djksaweoiakld为的首付款看见了大三围殴4532"
	code.g = "df4asf2f2sa021f as ads0 1 f1a "
	code.h = "*(@!#*#&!(*#er9 8	2938p uoi erwje"
	code.i = "dafifsad as d3()rq ewo~`/dafdfs/'fasd/f'"

	local file = io.open("./test.txt", "w")
	if file == nil then
		print("error")
		return
	end

	for k, v in pairs(code) do
		file:write(v .. "      " .. makesign(v) .. '\n' .. '\n')
		-- print(k, v)
	end

	file:close()
]]--

end
