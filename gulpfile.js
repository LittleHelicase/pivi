
var gulp = require("gulp");
var source = require('vinyl-source-stream');
var browserify = require("browserify");
var jshint = require("gulp-jshint");
var handlebars = require("gulp-compile-handlebars");
var rename = require("gulp-rename");
var peg = require("gulp-peg");
var gutil = require("gulp-util");
var mocha = require("gulp-mocha");
var clean = require("gulp-clean");
var uglify = require("gulp-uglify");

// All dynamically loaded libraries and their aliases.
// One could do this a bit more elegant, however, this is the quick-and-dirty solution.
var libs = [
  ["./lib/commands/ellipse_data.js", "./commands/ellipse_data.js"],
  ["./lib/commands/line_data.js", "./commands/line_data.js"],
  ["./lib/commands/point_data.js", "./commands/point_data.js"],
  ["./lib/commands/properties.js", "./commands/properties.js"],
  ["./lib/commands/stack_operations.js", "./commands/stack_operations.js"]
];

gulp.task("build-browser", function() {
  var b = browserify('./piviBrowser.js', { standalone: 'pivi' });

  for (var i = 0; i < libs.length; i++)
    b.require(libs[i][0], { expose: libs[i][1] });

  return b.bundle()
    .on('error', function (e) {
      gutil.log(e);
    })
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./browser'));
});
/*
  browser-uglify must be run after all build-tasks, as it is depended on the
  completion of the build-browser task!
  Gulp currenlty does not support sequential tasks without external modules.
*/
gulp.task("browser-uglify", function() {
  return gulp.src('./browser/bundle.js')
    .pipe(uglify())
    .pipe(gulp.dest('./browser-min/'));
});

gulp.task("jshint", function(){
  gulp.src(["./lib/*.js","!./lib/grammar.js"])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task("clean", function(){
  gulp.src("./lib/grammar.js")
    .pipe(clean());
});

gulp.task("build-grammar", function(){
  gulp.src("./lib/grammar.peg")
    .pipe( peg( ).on( "error", gutil.log ) )
    .pipe(gulp.dest("./lib/"));
});

gulp.task("specification", ["build-grammar","build-specification"]);

gulp.task("build-specification", ["build-grammar"], function(){
  var pivi = require("./lib/api.js");
  var i=0;
  options = {
    noEscape: true,
    helpers:
    {
      example: function(piviStr){
        i++;
        if(piviStr.indexOf("newframe") != -1){
          pivi.processAnimationString(piviStr, "specification/example"+i+".gif");
          return "```\n"+piviStr+"\n```\n![](example"+i+".gif)\n";
        } else {
          pivi.processString(piviStr, "specification/example"+i+".png");
          return "```\n"+piviStr+"\n```\n![](example"+i+".png)\n";
        }
  }}};
  gulp.src("./specification/spec.md.hbs")
    .pipe(handlebars({},options))
    .pipe(rename("specification.md"))
    .pipe(gulp.dest("./specification/"));
});

gulp.task("run-tests", ["build-grammar"], function(){
  gulp.src("./test/*.js")
    .pipe(mocha());
});

gulp.task("test", ["build-grammar", "build-browser", "run-tests"]);
