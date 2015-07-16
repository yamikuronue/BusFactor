var gitModule = require('../lib/git.js');
var svnModule = require('../lib/svn.js');
var assert = require('chai').assert;
var sinon = require('sinon');
var Repo = require( "git-tools" );
var child_process = require("child_process");
var fs = require("fs");
var Paths = require("path");
var events = require('events');

(function() {
    var childProcess = require("child_process");
    oldSpawn = childProcess.spawn;
    function mySpawn() {
        console.log('spawn called');
        console.log(arguments);
        var result = oldSpawn.apply(this, arguments);
        return result;
    }
    childProcess.spawn = mySpawn;
})();

describe("git adapter", function() {
	var sandbox;

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
	});

	afterEach(function() {
		sandbox.restore();
	});

	/*it("should interface with git correctly", function(done) {
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
	});*/

	it("should report one author when there's one author", function(done) {
		var fakeRepo = sandbox.stub(Repo,"clone").yields(null,{});
		var stream = fs.createReadStream(Paths.join(__dirname,'gitblame_oneauth.txt'));
		
		var fakeSpawn = sandbox.stub(child_process, "spawn").returns({
				stdout: stream,
				stderr: new events.EventEmitter(), //no events needed
				on: function(event, callback) {
					stream.on(event, callback);
				}
			});

		this.timeout(50000);
		gitModule.init("https://github.com/yamikuronue/BusFactor.git", "tmp/repo1",function(err) {
			fakeRepo.restore();
			gitModule.getOwner("test/repoTests.js", function(err, author) {
				assert.notOk(err);
				assert.equal("Yami", author);
				done();
			})
		});
	})
	
	it("should not hit the blank-author bug", function(done) {
		var fakeRepo = sandbox.stub(Repo,"clone").yields(null,{});
		var stream = fs.createReadStream(Paths.join(__dirname,'gitblame_noauth.txt'));
		
		var fakeSpawn = sandbox.stub(child_process, "spawn").returns({
				stdout: stream,
				stderr: new events.EventEmitter(), //no events needed
				on: function(event, callback) {
					stream.on(event, callback);
				}
			});

		this.timeout(50000);
		gitModule.init("https://github.com/yamikuronue/BusFactor.git", "tmp/repo1",function(err) {
			fakeRepo.restore();
			gitModule.getOwner("test/repoTests.js", function(err, author) {
				assert.notOk(err);
				assert.equal("Yami", author);
				done();
			})
		});
	})
	
	it("should not hit the blank-author bug (alt input 1)", function(done) {
		var fakeRepo = sandbox.stub(Repo,"clone").yields(null,{});
		var stream = fs.createReadStream(Paths.join(__dirname,'gitblame_cartman.txt'));
		
		var fakeSpawn = sandbox.stub(child_process, "spawn").returns({
				stdout: stream,
				stderr: new events.EventEmitter(), //no events needed
				on: function(event, callback) {
					stream.on(event, callback);
				}
			});

		this.timeout(50000);
		gitModule.init("https://github.com/yamikuronue/BusFactor.git", "tmp/repo1",function(err) {
			fakeRepo.restore();
			gitModule.getOwner("test/repoTests.js", function(err, author) {
				assert.notOk(err);
				assert.equal("cartmans.name", author);
				done();
			})
		});
	})
	
	it("should not hit the blank-author bug (alt input 2)", function(done) {
		var fakeRepo = sandbox.stub(Repo,"clone").yields(null,{});
		var stream = fs.createReadStream(Paths.join(__dirname,'gitblame_likes.txt'));
		
		var fakeSpawn = sandbox.stub(child_process, "spawn").returns({
				stdout: stream,
				stderr: new events.EventEmitter(), //no events needed
				on: function(event, callback) {
					stream.on(event, callback);
				}
			});

		this.timeout(50000);
		gitModule.init("https://github.com/yamikuronue/BusFactor.git", "tmp/repo1",function(err) {
			fakeRepo.restore();
			gitModule.getOwner("test/repoTests.js", function(err, author) {
				assert.notOk(err);
				assert.equal("Yamikuronue", author);
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