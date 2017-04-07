'use strict';

const del = require('del');
const gulp = require('gulp');
const path = require('path');
const runSequence = require('run-sequence');
const childProcess = require('child_process');
const plugins = require('gulp-load-plugins')({
    lazy: true
});

gulp.task('clean', () => {
    return del(['dist']);
});

gulp.task('build:js', () => {
    return gulp.src([ '**/*.js' ], { cwd: 'server' })
        .pipe(plugins.plumber())
        .pipe(plugins.changed('dist'))
        .pipe(plugins.babel())
        .pipe(gulp.dest('dist'));
});

gulp.task('watchs', (done) => {
    gulp.watch('**/*.js', { cwd: 'server' }, ['build:js']);

    done();
});

gulp.task('nodemon', (done) => {
    plugins.nodemon({
        script: 'dist/index.js',
        watch: [
            'dist'
        ],
        delay: 5,
        ext: 'js json'
    });

    done();
});

gulp.task('build', (done) => {
    runSequence(
        'clean',
        'build:js',
        done);
});

gulp.task('debug', (done) => {
    runSequence(
        'build',
        'nodemon',
        'watchs',
        done);
});
