// our wrapper function (required by grunt and its plugins)
// all configuration goes inside this function
module.exports = function(grunt) {
    var logfile = require('logfile-grunt');

    // ===========================================================================
    // CONFIGURE GRUNT ===========================================================
    // ===========================================================================
    grunt.initConfig({

        // get the configuration info from package.json ----------------------------
        // this way we can use things like name and version (pkg.name)
        pkg: grunt.file.readJSON('package.json'),

        // all of our configuration will go here
        jshint: {
            options: {
                reporter: require('jshint-stylish') // use jshint-stylish to make our errors look and read good               
            },

            // when this task is run, lint the Gruntfile and all js files in src
            build: ['gruntfile.js', 'js/pixi_warjack_box.js']
        },

        uglify: {
            options: {
                banner: '/*\n <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n'
            },
            build: {
                files: {
                    'js/pixi_warjack_box.min.js': 'js/pixi_warjack_box.js'
                }
            }
        },       

        watch: {          
            scripts: {
                files: 'src/**/*.js',
                tasks: ['jshint', 'uglify']
            }
        }

    });

    grunt.task.registerTask('buildlog', 'Create a new release build log files on each run.', function() {
        logfile(grunt, {
            filePath: 'log/warjack.txt',
            clearLogFile: true 
        });
    });

    grunt.registerTask('dev', ['buildlog','jshint']);
    grunt.registerTask('minify', ['buildlog','jshint','uglify']);



    // ===========================================================================
    // LOAD GRUNT PLUGINS ========================================================
    // ===========================================================================
    // we can only load these if they are in our package.json
    // make sure you have run npm install so our app can find these
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');

};
