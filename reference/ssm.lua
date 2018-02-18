-- simple scene manager
-- @mzxio

-- scenes ---------------------

scene = {}

scene.active = 0

scene.update = {}

scene.draw = {}

-------------------------------

scene.cycle = function()
	if scene.active < #scene.draw then
		scene.active += 1
	else
		scene.active = 0
	end
end

scene.reset = function()
	scene.active = 0
end

scene.updates = function()
	if scene.update[scene.active] != nil then
		scene.update[scene.active]()
	end
end

scene.drawing = function()
	if scene.draw[scene.active] != nil then
		scene.draw[scene.active]()
	end
end

-------------------------------

-- scene zero
-- time clock and instructions

scene.update[0] = function()
	calc.clock()
end

scene.draw[0] = function()
	cls()
	rectfill(0,0,128,128,12)
	print('scene zero!',40,60,1)
	layer.howto()
	layer.clock()
end

-- scene one
-- draws clock without updates

scene.draw[1] = function()
	cls()
	rectfill(0,0,128,128,14)
	print('scene one!',40,60,12)
	layer.howto()
	layer.clock()
end

-- scene two
-- rolls a random d20

scene.update[2] = function()
	calc.roller()
end

scene.draw[2] = function()
	cls()
	rectfill(0,0,128,128,9)
	print('scene two!',40,60,5)
	layer.dice()
end

-- scene three
-- just a scene

scene.draw[3] = function()
	cls()
	rectfill(0,0,128,128,5)
	print('scene three!',40,60,9)
end


-- calculations ---------------

calc = {}

nowish = 0

calc.clock = function()
	nowish = time()
end

dice, cooldown = 0, 0

calc.roller = function()
	if cooldown < 1 then
		dice = rnd()*20
		cooldown = 60
	else
		cooldown -= 1
	end
	
end


-- draw layers ----------------

layer = {}

layer.howto = function()
	print('\x8e cycle',46,71,7)
	print('\x97 reset',46,81,7)
end

layer.clock = function()
	print('time: '..nowish, 34, 120)
end

layer.dice = function()
	print('roll: '..dice, 38, 110)
end


-- inputs ---------------------

function input ()

	if btnp(4) then
		scene.cycle()
	end
	
	if btnp(5) then
		scene.reset()
	end

end


-- pico -----------------------

function _init()
end

function _update()
	input()
	scene.updates()
end

function _draw()
	scene.drawing()
end
