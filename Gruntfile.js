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
        livereload: true
      },
      scripts: {
        files: ["app/scripts/*.js", "Gruntfile.js"],
        tasks: ["ngdocs"]
      }
    },
    /* Create a new server in the port 8080*/
    connect: {
      all: {
        options: {
          port: 8080,
          hostname: "0.0.0.0"
        }
      }
    },
    /* Open a new tab in the default navigator*/
    open: {
      all: {
        path: "http://localhost:<%= connect.all.options.port%>/docs"
      }
    }
  });

  grunt.loadNpmTasks("grunt-ngdocs");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-connect");
  grunt.loadNpmTasks("grunt-open");
  grunt.loadNpmTasks("grunt-contrib-livereload");

  grunt.registerTask("default", "ngdocs");
  grunt.registerTask("server", ["connect", "ngdocs", "watch"]);
};
