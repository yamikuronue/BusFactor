var gitModule = require('../lib/git.js');
var svnModule = require('../lib/svn.js');
var assert = require('chai').assert;
var sinon = require('sinon');
var Repo = require( "git-tools" );
var child_process = require("child_process");
var fs = require("fs");
var Paths = require("path")

describe("git adapter", function() {
	var sandbox;

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
	});

	afterEach(function() {
		sandbox.restore();
	});

	it("should interface with git correctly", function(done) {
		 this.timeout(50000);
		gitModule.init("https://github.com/yamikuronue/BusFactor.git", "tmp/repo1",function(err) {
			if (err) {
				console.log(err);
				assert.ok(false);
			}
			gitModule.getOwner("test/repoTests.js", function(err, author) {
				assert.notOk(err);
				assert.equal("Yami", author);
				done();
			})
		});
	});

	it("should report one author when there's one author", function(done) {
		var fakeRepo = sandbox.stub(Repo,"clone").yields(null,{});

		var fakeGit = {
			
		}

		this.timeout(50000);
		gitModule.init("https://github.com/yamikuronue/BusFactor.git", "tmp/repo1",function(err) {
			fakeRepo.restore();
			var stream = fs.createReadStream(Paths.resolve('gitblame_oneauth.txt'));

			var fakeSpawn = sandbox.stub(child_process,"spawn").returns({
				stdout: stream,
				stderr: {
					on: function(){
						return; //No errors called
					}
				},
				on: function(event, callback) {
					stream.on(event, callback);
				}
			});


			gitModule.getOwner("test/repoTests.js", function(err, author) {
				assert.notOk(err);
				assert.equal("Yami", author);
				done();
			})
		});
	})
});

/*describe("svn adapter", function() {
	it("should interface with SVN correctly", function(done) {
		 this.timeout(100000); //SVN is slow, it's a big repo
		svnModule.init("https://core.svn.wordpress.org/trunk/", "tmp/repo2",function() {
			svnModule.getOwner("license.txt", function(err, author) {
				assert.notOk(err);
				assert.equal("ryan", author);
				done();
			})
		});
	});
})*/