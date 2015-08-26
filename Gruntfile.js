'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  var devPath = 'src';
  var distPath = 'dist';
  var tmpPath = '.tmp';

  var jsFiles = [devPath + '/scripts/{,*/}*.js'];
  var htmlFiles = [devPath + '/index.html'];

  // Kill the noise for now. Handle these errors later:
  //                 devPath + '/views/{,*/}*.html'];
  // appJsFiles is for rev.
  var appJsFiles = ['/scripts/{,*/}*.js',
                   ];
  // appImageFiles is for rev.
  var appImageFiles = ['/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'];
  // appCssFiles is for rec and usemin/cssmin
  var appCssFiles = ['/styles/{,*/}*.css'];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    projectname: '<%= pkg.name %>',

    // Project settings available as grunt templates: <%= projCfg.dev %> etc.
    projCfg: {
      dev: devPath,
      dist: distPath,
      tmp: tmpPath,
    },

    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      bower: {
        files: ['bower.json'],
        tasks: ['bowerInstall']
      },
      js: {
        files: jsFiles,
        tasks: ['newer:jshint:js'],
        options: {
          livereload: true
        }
      },
      html: {
        files: htmlFiles,
        tasks: ['newer:bootlint'],
        options: {
          livereload: true
        }
      },
      // no need for livereload here, since we watch the generated css:
      compass: {
        files: ['<%= projCfg.dev %>/scss/{,*/}*.{scss,sass}'],
        tasks: ['compass:dev', 'autoprefixer', 'copy:dev']
      },
      livereload: {
        options: {
          livereload: true
          //livereload: '<%= connect.options.compareApp %>'
        },
        files: [
          '<%= projCfg.dev %>/**/*.html',
          '<%= projCfg.dev %>/styles/{,*/}*.css',
          '<%= projCfg.dev %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      js: {
        src: jsFiles
      },
    },

    bootlint: {
      options: {
        stoponerror: false,
        relaxerror: []
      },
      files: htmlFiles
    },
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: '0.0.0.0',
        livereload: 35729
      },
      dev: {
        options: {
          open: true,
          base: '<%= projCfg.dev %>'
        }
      },
      dist: {
        options: {
          open: true,
          base: '<%= projCfg.dist %>'
        }
      }
    },

    clean: {
      all: {
        files: [{
          dot: true,
          src: [
            '<%= projCfg.tmp %>',
            '<%= projCfg.dist %>/*',
            '<%= projCfg.dev %>/styles/*.css',
            '!<%= projCfg.dist %>/.git*'
          ]
        }]
      },
      dev:' <%= projCfg.tmp %>'
    },


    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= projCfg.tmp %>/styles/',
          src: '{,*/}*.css',
          dest: '<%= projCfg.tmp %>/styles/'
        }]
      }
    },

    // Automatically inject Bower components.
    // In the html there are two sections: bower:css and bower:js, in the
    // compareapp.scss there is a bower:scss section - this selects the type of resource
    // to insert.
    bowerInstall: {
      app: {
        src: ['<%= projCfg.dev %>/index.html'],
        // ignorePath: the part of a file's path that gets ignored when inserting it:
        ignorePath: new RegExp('^<%= projCfg.dev %>/'),
        // ignores the bootstrap js from bootstrap-sass-official - we use UI Bootstrap
        exclude: ['bootstrap-sass-official']
      },
      sass: {
        src: ['<%= projCfg.dev %>/scss/{,*/}*.{scss,sass}'],
        ignorePath: '<%= projCfg.dev %>/bower_components/'
      }
    },

    // Compiles Sass to CSS and generates necessary files if requested
    compass: {
      options: {
        sassDir: '<%= projCfg.dev %>/scss',
        cssDir: '<%= projCfg.tmp %>/styles',
        generatedImagesDir: '<%= projCfg.tmp %>/images/generated',
        imagesDir: '<%= projCfg.dev %>/images',
        javascriptsDir: '<%= projCfg.dev %>/scripts',
        fontsDir: '<%= projCfg.dev %>/styles/fonts',
        importPath: '<%= projCfg.dev %>/bower_components',

        httpImagesPath: '/images',
        httpGeneratedImagesPath: '/images/generated',
        httpFontsPath: '/styles/fonts',

        relativeAssets: true,
        assetCacheBuster: false,
        raw: 'Sass::Script::Number.precision = 10\n'
      },
      dist: {
        // options: {
        //   generatedImagesDir: '<%= projCfg.dist %>/images/generated'
        // }
      },
      dev: {
        options: {
          // change to true to se more info when compiling:
          debugInfo: false
        }
      }
    },

    // Renames files for browser caching purposes
    // todo: only our app files
    rev: {
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= projCfg.dist %>',
            src: [appJsFiles, appImageFiles, appCssFiles, '<%= projCfg.dist %>/styles/fonts/*']
            //dest: 'build/',   // Destination path prefix.
            //extDot: 'first'   // Extensions in filenames begin after the first dot
          },
        ],
      }
    },

    // Reads HTML for usemin blocks ('build') to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: [
        '<%= projCfg.dev %>/index.html'
      ],
      options: {
        dest: '<%= projCfg.dist %>',
        staging: '<%= projCfg.tmp %>',
        flow: {
          html: {
            steps: {
              js: ['concat', 'uglifyjs'],
              css: ['cssmin']
            },
            post: {}
          }
        }
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: [
        '<%= projCfg.dist %>/index.html',
        // Also process these, for resources like images etc.: TODO: does it work?
        '<%= projCfg.dist %>/html/{,*/}*.html'
      ],
      css: {
        files: [
          {
            expand: true,
            cwd: '<%= projCfg.dist %>',
            src: appCssFiles
            //dest: 'build/',   // Destination path prefix.
            //extDot: 'first'   // Extensions in filenames begin after the first dot
          },
        ],
      },
      options: {
        assetsDirs: ['<%= projCfg.dist %>', '<%= projCfg.dist %>/images']
      }
    },

    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= projCfg.dev %>/images',
          // generated are handled by copy:
          src: ['{,*/}*.{png,jpg,jpeg,gif}', '!generated/'],
          dest: '<%= projCfg.dist %>/images'
        }, {
          expand : true,
          flatten : true,
          cwd : '<%= projCfg.dev %>/bower_components',
          src : '**/*.{png,jpg,jpeg,gif}',
          // TODO. Why styles? Because they are refered to from styles relatively?:
          dest : '<%= projCfg.dist %>/styles'
        }]
      }
    },

    // ngmin tries to make the code safe for minification automatically by
    // using the Angular long form for dependency injection. It doesn't work on
    // things like resolve or inject so those have to be done manually.
    ngmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= projCfg.tmp %>/concat/scripts',
          src: '*.js',
          dest: '<%= projCfg.tmp %>/concat/scripts'
        }]
      }
    },

    // Copies remaining files to places other tasks can use
    // (Together with usemin)
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          // Copy styles back to dev so cssmin can work on them, copying them to dist
          cwd: '<%= projCfg.tmp %>',
          dest: '<%= projCfg.dev %>',
          src: [
            'styles/{,*/}*.css',
          ]
        }, {
          expand: true,
          cwd: '<%= projCfg.tmp %>/images',
          dest: '<%= projCfg.dist %>/images',
          src: ['generated/**']
        }, {
          expand: true,
          dot: true,
          cwd: '<%= projCfg.dev %>',
          dest: '<%= projCfg.dist %>',
          src: [
            // styles and images are copied to dist by cssmin and imagemin
            '*.{ico,png,txt}',
            '*.html',
            'images/{,*/}*.{webp}',
            'scripts/{,*/}*.js',
            'styles/{,*/}*.htc',
            'styles/fonts/*',
            'html/{,*/}*.html',
            '*.xml',
            '*.topojson',
          ]
        }, {
          expand: true,
          dot: true,
          cwd: '<%= projCfg.tmp %>/styles/',
          dest: '<%= projCfg.dist %>/styles/',
          src: [
            'ie8fixes.css'
          ]
        }, {
          expand: true,
          dot: true,
          cwd: '<%= projCfg.dev %>/bower_components/bootstrap-sass-official/vendor/assets/fonts/bootstrap/',
          dest: '<%= projCfg.dist %>/styles/fonts/',
          src: '*'
        }
        ]
      },
      // copies generated files (images and css) from tmp to dev:
      dev: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= projCfg.tmp %>',
          dest: '<%= projCfg.dev %>',
          src: [
            'styles/{,*/}*.css',
            'images/generated/**'
          ]
        }, {
          expand: true,
          dot: true,
          cwd: '<%= projCfg.dev %>/bower_components/bootstrap-sass-official/vendor/assets/fonts/bootstrap/',
          dest: '<%= projCfg.dev %>/styles/fonts/',
          src: '*'
        }]
      }
    },


    // Run some tasks in parallel to speed up the build process
    concurrent: {
      dist: [
        'compass:dist',
        'imagemin',
      ]
    },

    // translate with angular-gettext
    nggettext_extract: {
      pot: {
        files: {
          '<%= projCfg.dev %>/po/template.pot': ['<%= projCfg.dev %>/html/{,*/}*.html']
        }
      },
    },

    nggettext_compile: {
      all: {
        files: {
          '<%= projCfg.dev %>/scripts/translations/translations.js': ['<%= projCfg.dev %>/po/*.po']
        }
      },
    },

  });

  grunt.registerTask('serve', [
    'buildDev',
    'connect:dev',
    'watch'
  ]);

  grunt.registerTask('serveDist', [
    'connect:dist:keepalive'
  ]);

  grunt.registerTask('buildDev', [
    'jshint',
    'clean:dev',
    'bowerInstall',
    'nggettext_extract',
    'nggettext_compile',
    'compass:dev',
    'autoprefixer',
    'copy:dev'
  ]);

  grunt.registerTask('buildDist', [
    'clean',
    'bowerInstall',
    'nggettext_extract',
    'nggettext_compile',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'concat',
    'ngmin',
    'copy:dist',
    'cssmin',
    'uglify',
    'rev',
    'usemin'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'buildDist'
  ]);

  grunt.log.write('Running grunt for project: ' + grunt.config.get('projectname') + '\n');
  grunt.log.write('devPath: ' + grunt.config.get('projCfg.dev') + '\n');
};
