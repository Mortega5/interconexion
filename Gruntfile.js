/*global module*/
module.exports = function(grunt) {
	grunt.initConfig({
		ngdocs: {
			options: {
				dest: "docs",
				title: "Documentation for ngBinding",
				startPage: "/api/ngBinding",
				inlinePartials: true,
				bestMatch: true,
				api: {
					src: ["app/scripts/*.js"],
					title: "API documentation"
				}
			},
			all: ["./app/scripts/*.js"]
		},
		/* Watch the changes of the files (in this case, scrips) and execute the task*/
		watch: {
			options: {
				livereload: true,
				spawn: false
			},
			scripts: {
				files: ["app/scripts/*.js", "Gruntfile.js", "app/images/*.{png,jpg,gif}"],
				tasks: ["ngdocs", "newer:imagemin"]
			}
		},
		useminPrepare: {
			html: "app/index.html",
			options: {
				dest: "."
			}
		},
		usemin: {html: ["app/build/index.html"]},
		uglify: {
			minControllers: {
				files: {
					"app/scripts/app.min.js": ["app/scripts/*.js", "!app/scripts/*.min.js"]
				}
			}
		},
		copy: {
			task0: {
				src: "app/index.html",
				dest: "app/build/index.html"
			}
		},
		imagemin: {
			main: {
				files: [{
					expand: true,
					cwd: "images",
					src: ["*.{png,jpg,gif,.svg}"],
					dest: "app/images/min"
				}]
			}
		},//imagemi

		images: {

			files: ["app/images//*.{png,jpg,gif}"],
			tasks: ["newer:imagemin"],
			options: {
				spawn: false
			}
		},

		browserSync: {
			bsFiles: {
				src: ["app/scrips/*.js", "app/styles/*.css", "app/index.html"]
			},
			options: {
				port: 8080,
				server: {
					baseDir: "./"
				}
			}

		},

		/* Limpia los ficheros temporales del concat */
		clean: [".tmp"]
	});

	grunt.loadNpmTasks("grunt-ngdocs");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-imagemin");
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-newer");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-usemin");
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-browser-sync");

	grunt.registerTask("server", "browserSync");
	grunt.registerTask("default", "ngdocs");
	grunt.registerTask("build", [
		"copy:task0",
		"useminPrepare",
		"concat",
		"uglify",
		"usemin",
		"clean"
	]);
};


