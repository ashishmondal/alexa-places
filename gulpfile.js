var gulp = require('gulp');
var ts = require('gulp-typescript');
var del = require('del');
var zip = require('gulp-zip');

gulp.task('clean', function () {
    del(['build/**'])
});

gulp.task('scripts', function () {
    return gulp.src('src/**/*.ts')
        .pipe(ts({
            noExternalResolve: true,
            target: 'ES5',
            module: 'commonjs',
            removeComments: true
        }))
        .pipe(gulp.dest('build'));
});

gulp.task('nodemodules', function () {
    return gulp.src('src/node_modules/**')
        .pipe(gulp.dest('build/node_modules'));
});

gulp.task('zip', function () {
    gulp.src('build/**')
        .pipe(zip('alexa.zip'))
        .pipe(gulp.dest('.'));
});

gulp.task('default', ['clean'], function () {
    gulp.start('scripts', 'nodemodules');
});

gulp.task('watch', ['scripts'], function () {
    gulp.watch('src/**/*.ts', ['scripts']);
});