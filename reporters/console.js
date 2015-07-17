var cliff = require("cliff");

module.exports = {

	reportError: function(err) {
		console.log("Error while scanning repository!");
		console.log(err);
	},

	report: function(data) {
		console.log("File owners:");
		console.log("========================");
		
		var fileData = data.files.map(function(item) {
			return [item.owner,item.filename];
		});
		fileData.unshift(["Owner", "File"]);

		
		console.log(cliff.stringifyRows(fileData,["red", "blue"]));

		console.log("\n\n");
		console.log("Authors:")
		console.log("========================");

				
		var authorData = [];
		authorData.push(["Author", "Files", "Percent"]);

		
		for (var i = 0; i < data.numAuthors; i++) {
			var currAuthor = data.ownersSorted[i];
			var percent = Math.round((data.owners[currAuthor]/data.numfiles * 100)) + "%";
			authorData.push([currAuthor, data.owners[currAuthor], percent]);
				
			if (i == data.busFactor-1) {
				authorData.push(["-----","-----","-----  Bus Factor Reached"]);
			}				
		}

		console.log(cliff.stringifyRows(authorData, ["red", "blue", "green"]));
		console.log("\n\n");
		console.log("Bus factor: " + data.busFactor);
		console.log("Total files: " + data.numfiles);
	}
}