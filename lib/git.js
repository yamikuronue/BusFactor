var Repo = require( "git-tools" );
var Path = require("path");
var async = require("async");
var rimraf = require("rimraf");
var repo;

module.exports = {	
	init: function(url, callback) {
		rimraf("tmp/repo1", function() {
			Repo.clone({
				repo: url,
				dir: "tmp/repo1"
			}, function(err, r) {
				repo = r;
				callback(err);
			});
		})
	},
	
	getOwner: function(file, callback) {
		console.log(repo);
		var fileAuthors = {};
		
		repo.blame({
			path: file
		}, function(err, blameArray) {
			if (err) {
				console.log(err); callback(err); return;
			}
			async.each(blameArray,function(blameObj, cb) {
				repo.authors(blameObj.commit, function(err, authors) {
					if(err) {
						cb(err);
						return;
					}
					if (!fileAuthors[authors[0].name]) {
						fileAuthors[authors[0].name] = 0;
					};
					
					fileAuthors[authors[0].name]++;
					cb();
				})
			}, function(err){
				if(err) {
					callback(err); return;
				}
								
				var max = 0;
				var winner = "";
				for(auth in fileAuthors) {
					if (fileAuthors[auth] > max) {
						max = fileAuthors[auth];
						winner = auth;
					}
				}
				
				callback(err, winner);
			});
		})
	}
	
	
}