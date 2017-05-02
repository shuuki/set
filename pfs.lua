-- pocket full of sand
-- @mzxio


-- constructors ---------------

-- vertex
-- x,y
function vtx(x, y)
	local c = {}
	c.x,c.y = x, y
	return c
end


-- math -----------------------

pi = 3.1415
rad = 2 * pi

-- ceiling
-- takes value
-- returns inverted floor
function ceil(x)
	return -flr(-x)
end

-- rounding
-- takes value
-- returns nearest whole number
function round(x)
	local r = abs(x - flr(x))
	if r >= 0.5 then
		return ceil(x)
	else
		return flr(x)
	end
end

-- modulo periodicity
-- takes time and period
-- returns 0-1
function mper(t, p)
	return (t % p) / p
end

-- sine periodicity
-- takes period and time
-- returns radian at time
function sper(p)
	return rad / p
end

-- precise random number
-- takes min, max
-- returns decimal in range
function prnd(min, max)
	return rnd() * (max - min) + min
end

-- rules ----------------------


-- phase
-- takes time, period, labels
-- returns current label
function phase(t, p, l)
	local q = mper(t, p)
	local i = ceil(q * #l)
	return l[i]
end

-- sky body
-- takes body, theta 0-1
-- returns x,y for body
function skybod(b, th)
	local pos = {}
	pos.x = b.ox + b.sw * cos(th)
	pos.y = b.oy - b.sh * sin(th)
	return pos
end

-- point angle
-- takes two bodies
-- returns angle between points
function pang(a, b)
 local x = b.x - a.x
 local y = b.y - a.y
	local ang = atan2(y, x)
	return ang
end

-- polar to coord
-- takes length, angle, offset
-- returns x,y
function ptoc(le, an, of)
	local pos = {}
	pos.x = of.x + le * cos(an)
	pos.y = of.y + le * sin(an)
	return pos
end


-- scenes ---------------------

scene = {}
-- current active scene
scene.a = 0
-- updates and drawings
scene.u = {}
scene.d = {}

scene.cycle = function()
	if scene.a < #scene.d then
		scene.a = scene.a + 1
	else
		scene.a = 0
	end
end

scene.reset = function()
	scene.a = 0
end

scene.updates = function()
	if scene.u[scene.a] != nil then
		scene.u[scene.a]()
	end
end

scene.drawing = function()
	if scene.d[scene.a] != nil then
		scene.d[scene.a]()
	end
end


-- inputs ---------------------

function input ()

	-- z
	if btnp(4) then
		scene.cycle()
	end
	
	-- x
	if btnp(5) then
		scene.reset()
	end


  -- time shifting controls
  local increment = 0.016
  
	-- up
	if btn(2) then
    smx = smx + increment
    calc.setsp()
	end
	
	-- down
	if btn(3) then
    smx = smx - increment
    calc.setsp()
	end

end


-- data -----------------------

d = {}

-- moon
d.moon = {}
-- period
d.moon.p = 672
-- origin x, y
d.moon.ox, d.moon.oy = 60, 60
-- set height, width
d.moon.sw, d.moon.sh = 54, 48
-- labels
d.moon.la = { 'new', 'crescent', 'first quarter', 'gibbous', 'full', 'disseminating', 'last quarter', 'balsamic' }
-- sprites
d.moon.sp = { 23, 24, 25, 26, 27, 28, 17, 18, 19, 20, 21, 22 }

-- year
d.year = {}
-- period
d.year.p = 8736
d.year.max = d.year.p * 3
-- labels
d.year.la = { 'summer', 'autumn', 'winter', 'spring' }

-- sun
d.sun = {}
-- period
d.sun.p = 24
-- origin x, y
d.sun.ox, d.sun.oy = 60, 60
-- set height, width
d.sun.sw, d.sun.sh = 54, 48
-- labels
d.sun.la = { 'twilight', 'night', 'midnight', 'night', 'twilight', 'dawn', 'morning', 'noon', 'afternoon', 'evening', 'dusk' }

-- sky
d.sky = {}
-- sky colors
d.sky.cl = { 1, 1, 0, 0, 1, 12, 12, 12, 12, 12, 12 }
-- moon colors
d.sky.ml = { 6, 6, 7, 7, 6,  6,  6,  6,  6,  6,  6 }
-- star colors
d.sky.sl = { 6, 6, 7, 7, 6, 12, 12, 12, 12, 12,  6 }


-- origin point
d.op = {}
-- x,y
d.op.x, d.op.y = 60, 64

-- sundial
d.sd = {}


-- venus
d.venus = {}
-- period
d.venus.p = 6552
-- origin x, y
d.venus.ox, d.venus.oy = 60, 60
-- set height, width
d.venus.sw, d.venus.sh = 54, 48


-- calculations ---------------

calc = {}

-- time
t = 82
-- speed
sp = 1/60
smx = 1
-- clock
clock = 0
year = 0

-- calendar update
calc.times = function()

	-- time
	t = t + sp

	-- reset to 0 at year maximum
	if t > d.year.max then t = 0 end

	-- theta of moon, sun, year
	mnt = mper(t, d.moon.p) --!
	snt = mper(t, d.sun.p) --!
	yrt = mper(t, d.year.p) --!
	vnt = mper(t, d.venus.p) --!

	-- current moon, year, day
	--mn = cos(mnt)
	yr = cos(yrt) --!
	da = cos(snt) --!

	-- moon label
	mx = phase(t, d.moon.p, d.moon.la)
	-- moon sprite
	ms = phase(t, d.moon.p, d.moon.sp)
	-- year label
	yx = phase(t, d.year.p, d.year.la)
	-- sun label
	sx = phase(t, d.sun.p, d.sun.la)

	skycol = phase(t, d.sun.p, d.sky.cl)
	mooncol = phase(t, d.sun.p, d.sky.ml)
	starcol = phase(t, d.sun.p, d.sky.sl)

	-- moon and sun positions
	d.sun.pos = skybod(d.sun, snt)
	d.moon.pos = skybod(d.moon, snt - mnt)
	d.venus.pos = skybod(d.venus, snt - vnt)

	clock = (sin(snt) + 1) / 2
	year = (yr+1)/2

	-- angle of the sun
	who = pang(d.op, d.sun.pos)
	
	-- season precession
	-- pixel values for screen
	--pry = 60 + -yr * 10
	local prh = 40 + yr * 10
	local prw = 48 + yr * 10
	--d.moon.oy, d.sun.oy = pry, pry
	d.moon.sh, d.moon.sw = prh, prw
	d.sun.sh, d.sun.sw = prh, prw
end


calc.setsp = function()
	local slowest = (1 / 1200)
	local offset = ((-1) + slowest)
	local ease = (1 + (smx / 64))^4
	local mult = offset + ease

  sp = mult
end


calc.shadows = function()

	-- sun angle
	local sang = 0

	-- check day/night
	if snt < 0.5 then
		-- night
		whe = d.op
	else
		-- day
		if snt < 0.75 then
			-- morning
			sang = (snt - 0.5) * 4
		else
			-- afternoon
			sang = (1 - snt) * 4
		end
		-- shadow line for sundial
		local shad = 8 - (sang * 4) - (yr * 2)
		whe = ptoc(shad, -who + 0.25, d.op)
	end
end


-- temperature
thrm = 288
-- temp change
tempch = 0

calc.temp = function()
	-- albedo modifier
	local alb = 0.7
	-- sun energy
	local seng = 0.523

	if clock > 0.5 then
		-- add heat if the sun is up
		local sunup = seng * clock
		local sunyr = 0.05 * year
		tempch = ((sunup + sunyr) * alb) * sp


		thrm = thrm + tempch
	else
		-- reduce temp by emmisivity
		tempch = -((1 - alb) * sp)

		thrm = thrm + tempch
		
		-- no going under 3 kelvin
		if thrm < 3 then
			thrm = 3
		end
	end
end

calc.temp2 = function()
	-- temp limit? max 35, min -20

	-- day change, year change
	local dc = 9
	local yc = 25
	
	-- daily + yearly temp ranges
	tempch = (da * dc) + (yr * yc)
	-- calculate temp		
	thrm = tempch
end

-- gradient
calc.grad = function ()

	local ang = 1 - clock

	g.c = {}
	--g.c[0] = 0
	g.c[ang] = 12
	
	-- nighttime
	if clock < 0.5 and clock >= 0 then
		g.c[ang-0.6] = 0
		g.c[ang-0.4] = 1
	end
	-- sunrise, sunset
	if clock > 0.3 and clock < 0.6 then
		g.c[ang - 0.2] = 12
		g.c[ang - 0.1] = 9
		g.c[ang] = 10
		g.c[ang + 0.1] = 8
	end
	-- daytime
	if clock > 0.5 and clock <= 1 then
		g.c[0] = 1
		g.c[ang + 0.2] = 12
		g.c[ang + 0.6] = 15
	end
-- noon
	if clock == 1 then
		g.c[0] = 12
	g.c[1] = 15
	end

end

-- gradient data --------------

g = {}
-- northwest, southeast corners
g.nw = vtx(0,0)
g.se = vtx(127,127)
-- geometry
g.w = g.se.x - g.nw.x
g.h = g.se.y - g.nw.y
g.a = g.w * g.h
-- colors
g.c = {}
g.c[0] = 0
g.c[0.2] = 1
g.c[0.8] = 12
g.c[1] = 15


-- gradient making ------------

-- dithering
-- takes two values
-- compares 
function dither(a, b) 
	-- rolls
	local r1 = rnd() * a
	local r2 = rnd() * b
	local rx = rnd() * (a-b)
	-- blur
	local bx = 1
	
	-- roll logic
	if rx < (r2 - r1) * bx then
	--if r1 < r2 then
		return 0
	else
		return 1
	end
end

-- takes row and color table
function gtween(r, c)	
	-- under, over
	local u, o = 0, 1
	-- find place in gradient plan
	for y,p in pairs(c) do
		if y < r and y > u then u = y end
		if y > r and y < o then o = y end
	end
	-- distance between under over
	local d1 = r - u
	local d2 = o - r
	-- dithering
	local x = dither(d1, d2)
	if x < 1 then
		return c[u]
	else
		return c[o]
	end
	-- fallback return red
	return 8
end

-- linear gradient
function gradz()
	-- default color
	local c = 8
	for i = 0, g.h do
		-- check every gradient row
		local r = i / g.h
		-- tween rows missing color
		if g.c[r] == nil then
			c = gtween(r, g.c)
		else
			c = g.c[r]
		end
		-- draw line
		local l = i + g.nw.y
		line(g.nw.x, l, g.se.x, l, c)
	end
end


-- draw layers ----------------

layer = {}

-- howto menu layers

layer.menu = function()
	print('\x8e',1,122,0)
	--print('\x8e cycle',46,101,13)
	--print('\x97 reset',46,111,13)
end

layer.menuclose = function()
	print('\x97',120,122,0)
end

-- times
layer.times = function()
	rectfill(0,94,128,128,1)
	print( 'speed '..sp, 1,78,12)
  print( 'smx   '..smx, 1,84,12)

	print( '\x85'..clock, 13,97,6)

	print('sun  '..snt,1,103,13)
	print(sx,60,103)

	spr(ms,50,107)
	print('moon '..mnt,1,109)
	print(mx,60,109)

	print('year '..yrt,1,115)
	print(yx,60,115)

	rectfill(0,121,128,128,13)
	print('time '..ceil(t),1,122,1)
end

-- thermometer
function layer.temp()
	local cels = thrm-- - 270

	print('temp '..cels,5,65,9)
	--print('tempch  '..tempch,3,71,4)
	--print('year '..year,3,77,4)
	-- mercury
	line(112, 93, 112, 93 - cels, 9)
	-- mercury labels
	print('+30', 115, 61, 4)
	print('+20', 115, 71, 4)
	print('+10', 115, 81, 4)
	print('-- 0', 109, 91, 4)
	print('-10', 115, 101, 4)	
	print('-20', 115, 111, 4)
	-- use origin point instead?
	pset(112,93,6)
end


-- sky
function layer.sky()
	pset(d.venus.pos.x+4,d.venus.pos.y+4,starcol)
	-- moon sprite
	pal(1,skycol)
	pal(13,mooncol)
	spr(ms,d.moon.pos.x,d.moon.pos.y)
	-- reset palette
	pal()
	-- sun sprite
	spr(16,d.sun.pos.x,d.sun.pos.y)
end


	-- ground
function layer.ground()
	rectfill(0,60,128,128,1)
end

-- sundial
function layer.sundial()
	-- pole
	line(d.op.x,d.op.y-1,d.op.x,d.op.y-5,13)
	-- shadow
	line(d.op.x,d.op.y,whe.x,whe.y,0)
end


-- sky gradient
layer.gradient = function()
	gradz()
end


-- scene stack ----------------

-- base scene

scene.u[0] = function()
	calc.times()
	calc.shadows()
	calc.grad()
	calc.temp2()
end

scene.d[0] = function()
	layer.gradient()
	layer.sky()
	layer.ground()
	layer.sundial()
	layer.menu()
end

-- timers and temperature

scene.u[1] = function()
	-- use base scene updates
	scene.u[0]()
end

scene.d[1] = function()
	layer.gradient()
	layer.sky()
	layer.ground()
	layer.times()
	layer.sundial()
	layer.temp()
	layer.menuclose()
end

-- no cls

scene.u[2] = function()
	scene.u[0]()
end

scene.d[2] = function()
	layer.sky()
	layer.sundial()
end

-- pico -----------------------

function _init()
end

function _update60()
	input()
	scene.updates()
end

function _draw ()
	scene.drawing()
end
