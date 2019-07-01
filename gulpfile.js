var gulp = require('gulp');
var ts = require('gulp-typescript');
var tsProject = ts.createProject('tsconfig.json');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var tsify = require('tsify');
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');
var paths = {
    pages: ['src/**/*.html'],
    assets: ['src/assets/**/*']
};

gulp.task('build-html', () => {
    return gulp.src(paths.pages)
        .pipe(gulp.dest('dist'));
});

gulp.task('build-assets', () => {
    return gulp.src(paths.assets)
        .pipe(gulp.dest('dist/public/assets'));
});


gulp.task('build-server', function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest('dist'));
});

gulp.task('build-public', () => {
    return browserify({
        basedir: '.',
        debug: true,
        entries: ['src/public/sketch.ts'],
        cache: {},
        packageCache: {}
    })
    .plugin(tsify)
    .transform('babelify', {
        presets: ['es2015'],
        extensions: ['.ts']
    })
    .bundle()
    .pipe(source('public/build.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist'));
})

gulp.task('default', gulp.series(
    gulp.parallel('build-html'),
    gulp.parallel('build-assets'),
    gulp.parallel('build-server'),
    gulp.parallel('build-public'),
));