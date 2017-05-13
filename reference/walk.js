
///////////////

var Walk = {
	time: 0,
	refresh: 240,
	init: function (type)
	{
		this.type = type;
		this.active = true;
		this.time = 0;
		this.step = 0;
		this.background = Object.create(Field).init(16);
		this.foreground = Object.create(Field).init(16);
		this.player = makeBeing(Data.entity['@']);

		return this;
	},
	update: function (time, scene)
	{
		this.updated = false;
		this.time += time.delta;
		this.now = time.lastUpdated;
		
		if (!this.active)
		{
			this.time = 0;
		}
		else if (this.active && this.time >= this.refresh)
		{
			// generate landscape spaces
			var spawn = makeEnviron(Data.biome, this.type);
			//console.log(spawn)

			this.background.add(spawn.background);
			this.foreground.add(spawn.foreground);

			// update time
			this.time -= this.refresh;
			this.step += 1;
			this.updated = true;

			// check head of foreground for entity encounter
			if (this.foreground.isOccupied(this.step))
			{
				// pause walk
				this.active = false;
				this.encounter(this.foreground.check(this.step), this.step)
			}

		}
	},
	draw: function (time, scene)
	{
		if (this.updated)
		{
			// combine foreground and background into one line
			var view = [];
			var up = this.foreground.draw(this.step);
			var down = this.background.draw(this.step);
			up.forEach(function (e, i) {
				if (e !== '_') { view[i] = e }
			});
			down.forEach(function (e, i) {
				if (!view[i]) { view[i] = e }
			});
			view = view.join('');

			document.getElementById('output').innerHTML = view;
			console.log(view)
		}
	},
	encounter: function (e, i)
	{
		var active = false;

		if (Data.entity.hasOwnProperty(e))
		{
			var template = makeClone(Data.entity[e]);
			var opponent = makeBeing(template);
			var players = [this.player, opponent];

			console.log('encounter', i, players)

			var tick = 0;
			active = true;

			while (active === true)
			{
				// automatically break after 11 ticks
				if (tick > 11)
				{
					console.log('encounter timed out')
					active = false;
					continue;
				}

				var update = decision(players, tick);
				players = update.players;
				active = update.active;

				tick += 1;
			}
		}

		if (this.player.get('alive') === false)
		{
			this.active = false;

			console.log('END', i)
		}
		else {
			// continue walk
			this.active = true;			
		}
	}
}

//var qux = Object.create(Walk)
//qux.init('plains')

///////////////

// TYPES

var Field = {
	init: function (width)
	{
		this.width = width;
		this.area = [];
		var i = width;
		while (i > 0) {
			i--;
			this.area.push('_');
		}

		return this;
	},
	add: function (v)
	{
		this.area.push(v)

		return this;
	},
	draw: function (pos)
	{		
		var view = this.area.slice(pos, pos + this.width)//.join('');
		this.view = view;

		//console.log(view)

		return view;
		//return this;
	},
	isOccupied: function (i)
	{
		if (this.area[i] === '_' )
		{
			return false;
		}
		else {
			return true;
		}
	},
	check: function(i)
	{
		if (this.area[i])
		{
			return this.area[i];
		}
		else {
			return false;
		}
	},
	last: function ()
	{
		var last = this.area.length - 1;
		return last;
	}
}

//var baz = Object.create(Field).init(12)
//baz.draw(0).add('V').draw(1).add('-').draw(2)

var Being = {
	// NAME
	named: function (name)
	{
		this.name = name;
		return this;
	},
	called: function ()
	{
		return this.name;
	},
	// STATS
	stats: {},
	make: function (stats)
	{
		this.stats = {};
		this.equipment = {};
		this.inventory = [];
		this.stats = Object.assign(this.stats, stats);
		this.stats.alive = true;
		return this;
	},
	assign: function (attributes)
	{
		Object.assign(this, attributes);
		return this;
	},
	is: function ()
	{		
		return this.stats;
	},
	get: function (stat)
	{
		return this.stats[stat];
	},
	change: function (stat, change)
	{
		this.stats[stat] += change;
		return this;
	},
	set: function (stat, value)
	{
		this.stats[stat] = value;
		return this;
	},
	kill: function ()
	{
		this.stats.alive = false;
		return this;
	},
	birth: function ()
	{
		this.stats.alive = true;
		return this;
	},
	// INVENTORY
	inventory: [],
	has: function ()
	{
		return this.inventory;
	},
	give: function (items)
	{
		this.inventory = items;
		return this;
	},
	add: function (item)
	{
		this.inventory.push(item);
		return this;
	},
	take: function (item)
	{
		var what = this.inventory.indexOf(item);
		this.inventory.splice(1, what);
		return this;
	},
	// EQUIPMENT
	// adds effects to stats
	equipment: {},
	equipped: function (type)
	{
		return this.equipment[type] || this.equipment;
	},
	equip: function (item)
	{
		if (item)
		{
			this.equipment[item.type] = item;
		}
		return this;
	},
	unequip: function (item)
	{
		if (this.equipment[item.type])
		{
			delete this.equipment[item.type];
		} 
		return this;
	},
	//
	check: function()
	{
		var check = {
			stats: this.is(),
			name: this.called(),
			inventory: this.has(),
			equipment: this.equipped()
		};
		return check;
	}
};

// var foo = Object.create(Being).name('FOO').give('fire');

var Weapon = {
	type: 'weapon',
	build: function(name, action, dam)
	{
		this.name = name;
		this.action = action;
		this.damage = {
			min: dam[0],
			max: dam[1],
			to: dam[2]
		};
		return this;
	}
};

// var bar = Object.create(Weapon).build('TEETH', 'BITE', [1, 3, 'life']);

///////////////
