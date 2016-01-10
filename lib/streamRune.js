var es = require("event-stream");
var Rune = require("rune.js");

var commands = {};

function addCommands(lib)
{
	for(var func in lib)
		commands[func] = lib[func];
}

addCommands(require("./rune/lines.js"));
addCommands(require("./rune/polyline.js"));
addCommands(require("./rune/circles.js"));
addCommands(require("./rune/points.js"));

function nodeToString(node, addNamespace)
{
	// open tag.
	var str = "<" + node.tagName;
	
	// add namespace attribute.
	if(addNamespace) str += ' xmlns="http://www.w3.org/2000/svg"';
	
	// add attributes.
	if(node.properties && node.properties.attributes)
	{
		var attrs = node.properties.attributes;
		for(var key in attrs)
		{
			if(attrs[key])
				str += ' ' + key + '=\"' + attrs[key].toString() + '"';
		}
	}
	
	str += ">";

	// add children.
	if(node.children)
	{
		node.children.forEach(function(child)
		{
			str += nodeToString(child);
		});
	}
	
	// close tag.
	str += "</" + node.tagName + ">";
	
	return str;
}

module.exports = function(outFile)
{
	outFile = outFile || "./out%d.svg";
	
	var rune = null;
	var state = 
	{
		color: "white",
		pointSize: 0.5,
		lineWidth: 1.0,
	}
	
	var initializeRune = function(data)
	{
		rune = new Rune(data);
	};
	
	initializeRune({width: 200, height: 200});
	
	return es.through(
		function write(data)
		{
			if(!data.type)
			{
				return;
			}
			else if(data.type === "initialize")
			{
				initializeRune(data);
			}
			else if(data.isProperty)
			{
				state[data.type] = data.data;
			}
			else
			{
				var cmd = commands[data.type];
				if(!cmd)
				{
					console.error(data.type + " not implemented.");
					return;
				}

				cmd(rune, state, data.data);
			}
		},
		function end()
		{
			rune.draw();
			
			var tree = rune.renderer.tree;
			var el = rune.getEl();
			
			console.log(nodeToString(tree, true));
		}
	);
}
