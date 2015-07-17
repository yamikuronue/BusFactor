var gitModule = require('../lib/git.js');
var svnModule = require('../lib/svn.js');
var assert = require('chai').assert;
var sinon = require('sinon');
var Repo = require( "git-tools" );
var child_process = require("child_process");
var fs = require("fs");
var Paths = require("path");
var events = require('events');

describe("git adapter", function() {
	var sandbox;
	var aliasStub;

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
	});
	afterEach(function() {
		sandbox.restore();
	});

	it("should load aliases", function(done) {
		this.timeout(10000);
		gitModule.init("https://github.com/yamikuronue/BusFactor.git", "tmp/repo2",function(err) {
			if (err) {
				console.log(err);	
			}
			
			assert.notOk(err);
			gitModule.loadAliases(function(aliases) {
				assert.equal(aliases["Yami"], "yamikuronue@gmail.com");
				assert.equal(aliases["Yamikuronue"], "yamikuronue@gmail.com");
				done();
			})
		});
	});


	//TODO: fix this test.
	/*it("should translate canonical names", function(done) {
		var stream = fs.createReadStream(Paths.join(__dirname,'gitShortlog.txt'));
		
		var fakeSpawn = sandbox.stub(child_process, "spawn").returns({
				stdout: stream,
				stderr: new events.EventEmitter(), //no events needed
				on: function(event, callback) {
					stream.on(event, callback);
				}
			});

		this.timeout(10000);
		gitModule.loadAliases(function() {
			gitModule.getCanonicalName("yamikuronue@gmail.com",function(name) {
				assert.ok(name);
				assert.equal("Yami", name);
				assert(fakeSpawn.called);
				done();
			});
		});
		
	})*/

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

		this.timeout(10000);
		var canonStub = sandbox.stub(gitModule,"getCanonicalName").yields("Yami");
		var aliasStub = sandbox.stub(gitModule, "loadAliases").yields({
				"Yami" : "yamikuronue@gmail.com",
			});
		gitModule.init("https://github.com/yamikuronue/BusFactor.git", "tmp/repo1",function(err) {
			gitModule.getOwner("test/repoTests.js", function(err, author) {
				assert.notOk(err);
				assert.equal("Yami", author);
				assert(canonStub.called);
				assert.equal("yamikuronue@gmail.com",canonStub.getCall(0).args[0]);	
				done();
			})
		});
	})

	describe("Blank author bug", function() {
		beforeEach(function() {
			sandbox = sinon.sandbox.create();
			aliasStub = sandbox.stub(gitModule, "loadAliases").yields({
				"Yamikuronue" : "yamikuronue@gmail.com",
				"Yami" : "yamikuronue@gmail.com",
				"yamikuronue":"yamikuronue@gmail.com",
				"cartmans.name" : "cartmans@email.com",
				"Accalia" : "Accalia@gmail.com",
				"Accalia Elementia" : "Accalia@gmail.com",
				"RaceproUK" : "racepro@gmail.com",
				"onyx47" : "onyx@gmail.com",
				"Onyx47" : "onyx@gmail.com"
			});
		});

		afterEach(function() {
			sandbox.restore();
		});

		it("should pass basic use case", function(done) {
			var fakeRepo = sandbox.stub(Repo,"clone").yields(null,{});
			var stream = fs.createReadStream(Paths.join(__dirname,'gitblame_noauth.txt'));
			
			var fakeSpawn = sandbox.stub(child_process, "spawn").returns({
					stdout: stream,
					stderr: new events.EventEmitter(), //no events needed
					on: function(event, callback) {
						stream.on(event, callback);
					}
				});

			this.timeout(10000);
			var canonStub = sandbox.stub(gitModule,"getCanonicalName").yields("Yami");
			gitModule.init("https://github.com/yamikuronue/BusFactor.git", "tmp/repo1",function(err) {
				fakeRepo.restore();
				gitModule.getOwner("test/repoTests.js", function(err, author) {
					assert.notOk(err);
					assert.equal("Yami", author);
					assert(canonStub.called);
					assert.equal("yamikuronue@gmail.com",canonStub.getCall(0).args[0]);
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

			this.timeout(10000);
			var canonStub = sandbox.stub(gitModule,"getCanonicalName").yields("cartmans.name");
			gitModule.init("https://github.com/yamikuronue/BusFactor.git", "tmp/repo1",function(err) {
				gitModule.getOwner("test/repoTests.js", function(err, author) {
					assert(aliasStub.called);
					assert.notOk(err);
					assert.equal("cartmans.name", author);
					assert(canonStub.called);
					assert.equal("cartmans@email.com",canonStub.getCall(0).args[0]);
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
				

			this.timeout(10000);
			var canonStub = sandbox.stub(gitModule,"getCanonicalName").yields("Accalia");
			gitModule.init("https://github.com/yamikuronue/BusFactor.git", "tmp/repo1",function(err) {
				gitModule.getOwner("test/repoTests.js", function(err, author) {
					assert.notOk(err);
					assert.equal("Accalia", author);
					assert(canonStub.called);
					assert.equal("accalia@gmail.com",canonStub.getCall(0).args[0]);
					done();
				})
			});
		})

		it("should not hit the blank-author bug (alt input 3)", function(done) {
			var fakeRepo = sandbox.stub(Repo,"clone").yields(null,{});
			var stream = fs.createReadStream(Paths.join(__dirname,'gitblame_maincss.txt'));
			
			var fakeSpawn = sandbox.stub(child_process, "spawn").returns({
					stdout: stream,
					stderr: new events.EventEmitter(), //no events needed
					on: function(event, callback) {
						stream.on(event, callback);
					}
				});
				

			this.timeout(10000);
			var canonStub = sandbox.stub(gitModule,"getCanonicalName").yields("Onyx47");
			gitModule.init("https://github.com/yamikuronue/BusFactor.git", "tmp/repo1",function(err) {
				gitModule.getOwner("test/repoTests.js", function(err, author) {
					assert.notOk(err);
					assert.equal("Onyx47", author);
					assert(canonStub.called);
					assert.equal("onyx@gmail.com",canonStub.getCall(0).args[0]);
					done();
				})
			});
		})

		it("should report no author for 0-byte files I guess", function(done) {
			var fakeRepo = sandbox.stub(Repo,"clone").yields(null,{});
			var stream = fs.createReadStream(Paths.join(__dirname,'gitblame_docs.txt'));
			
			var fakeSpawn = sandbox.stub(child_process, "spawn").returns({
					stdout: stream,
					stderr: new events.EventEmitter(), //no events needed
					on: function(event, callback) {
						stream.on(event, callback);
					}
				});
				

			this.timeout(10000);
			var canonStub = sandbox.stub(gitModule,"getCanonicalName").yields("Yamikuronue");
			gitModule.init("https://github.com/yamikuronue/BusFactor.git", "tmp/repo1",function(err) {
				gitModule.getOwner("test/repoTests.js", function(err, author) {
					assert.notOk(err);
					assert.equal("Yamikuronue", author);
					assert(canonStub.called);
					assert.equal("",canonStub.getCall(0).args[0]);
					done();
				})
			});
		})
	});
	})


