var gulp = require('gulp'),
	fs = require('fs'),
	path = require('path'),
	watch = require('gulp-watch'),
	less = require('gulp-less'),
	livereload = require('gulp-livereload'),
	watchify = require('watchify'),
	source = require('vinyl-source-stream'),
	browserify = require('browserify');

gulp.task('browserify', function(){
	return browserify('./public/js/main.js')
		.bundle()
		.pipe(source('bundle.js'))
		.pipe(gulp.dest('./public/js/build/'));
});

gulp.task('less', function(){
	return gulp.src('./public/styles/main.less')
		.pipe(less({
			paths: [ path.join(__dirname, 'public', 'styles') ]
		}))
		.pipe(gulp.dest('./public/styles/'));
});

gulp.task('watch', function(){

	gulp.watch('./public/js/**/*.js', ['browserify'], function(){
		livereload();
	});

	gulp.watch('./public/styles/**/*.less', ['less'], function(){
		livereload();
	});

	livereload.listen(35729);
});

gulp.task('default', ['watch']);