module.exports = function(grunt) {
		grunt.initConfig({
				ngdocs: {
						options: {
								title: "Documentation for ngBinding"
						},
						all: ["./app/scripts/*.js"]
				},
				watch: {
						scripts: {
								files: ["app/scripts/*.js", "Gruntfile.js"],
								tasks: ['ngdocs']
						}
				}
		});

		grunt.loadNpmTasks("grunt-ngdocs");
		grunt.loadNpmTasks('grunt-contrib-watch');

		grunt.registerTask("default", "ngdocs");
};
