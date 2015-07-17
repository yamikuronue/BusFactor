var recursive = require('recursive-readdir');
var Path = require("path");
var async = require("async");
var fs = require("fs");
 
var files = [];
var location = Path.join("tmp","wc"); //TODO: this ought to be better
var output = require('./reporters/console');

var argv = require('yargs')
    .option('r', {
        alias : 'repo',
        demand: true,
        describe: 'Repository to scan',
        type: 'string',
        nargs: 1
    })
    .option('t', {
        alias : 'type',
        demand: false,
        default: 'auto',
        describe: 'Type of repository. Accepts "git", "hg", "svn", or "auto"',
        type: 'string',
        nargs: 1
    })
    .argv;

if (argv.type === 'auto') {
	if (argv.repo.indexOf('git') > -1) {
		argv.type = 'git';
		console.log("Auto-detected Git repository");
	} else if (argv.repo.indexOf('svn') > -1) {
		argv.type = 'svn';
		console.log("Auto-detected SVN repository");
	} else if (argv.repo.indexOf('hg') > -1) {
		argv.type = 'hg';
		console.log("Auto-detected Hg repository");
	} else {
		console.log("Could not detect repository type, please be explicit!");
	}
}

var repoAdapter = require("./lib/" + argv.type.toLowerCase());


repoAdapter.init(argv.repo, location, function(err) {
	if (err) {
		output.reportError(err);
		return;
	}
	recursive(location, [Path.join("**",".git","*"),".gitignore",Path.join("**",".svn","*"),".hg*"], function (err, lsFiles) {
		lsFiles = lsFiles.filter(function (value, index, array){
			var stats = fs.statSync(value);
 			return stats.size > 0;
		});
		async.eachSeries(lsFiles,function(file, cb) {
			file = file.replace(location + Path.sep,"");
			repoAdapter.getOwner(file,function(err, owner) {
				if (!err) {
					files.push({
						"filename": file,
						"owner": owner
					});
				};
				cb(err);
			})
		}, function(err) {
			if (err) {
				output.reportError(err);
				return;
			}

			var numfiles = files.length;
			var candidates = {};

			for (var i = 0; i < numfiles; i++) {
				var owner = files[i].owner;
				if (!candidates[owner]) {
					candidates[owner] = 0;
				}
				candidates[owner]++;
			}
			
			//Sort the authors
			var ownersSorted = Object.keys(candidates).sort(function(a,b){return candidates[b]-candidates[a]})
			var numAuthors = ownersSorted.length;
			
			var runningTotal = 0;
			var busFactor = 0;
			var dead = false;
			
			
			for (var i = 0; i < numAuthors; i++) {
				runningTotal += candidates[ownersSorted[i]];	
				
				if (!dead) busFactor++;
				if (runningTotal >= numfiles/2 && !dead) {
					dead = true;
				}				
			}

			var data = {
				"numfiles": numfiles,
				"files": files,
				"numAuthors": numAuthors,
				"owners": candidates,
				"ownersSorted": ownersSorted,
				"busFactor": busFactor
			};	
			
			output.report(data);
			
		});
	});

})
