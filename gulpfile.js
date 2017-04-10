const del = require('del');
const gulp = require('gulp');
const path = require('path');
const yargs = require('yargs');
const runSequence = require('run-sequence');
const BrowserSync = require('browser-sync');
const plugins = require('gulp-load-plugins')({
    lazy: true
});

const argv = yargs
    .env('wizeshort')
    .option('release', {
        description: 'Build a release version',
        type: 'boolean'
    })
    .option('watch', {
        description: 'Watch for tests',
        type: 'boolean'
    })
    .argv;

const config = {
    appName: 'wizeshort'
};

const browserSync = BrowserSync.create(config.appName);

const vendorFiles = require('./vendor.json');

gulp.task('build:clean', () => {
    return del(['dist', 'public']);
});

gulp.task('build:js:web', [], () => (
    gulp.src('**/*.html', { cwd: 'app/components/' })
        .pipe(plugins.if(argv.cibuild, plugins.util.noop(), plugins.plumber()))
        .pipe(plugins.angularTemplatecache('templates.js', {
            module: config.appName,
            base: file => file.relative.split(path.sep).slice(-3).join(path.sep)
        }))
        .pipe(plugins.addSrc([
            'app.module.js',
            'app.config.js',
            '**/*.module.js',
            '**/*.config.js',
            '**/*.constants.js',
            '**/*.service.js',
            '**/*.resources.js',
            '**/*.factory.js',
            '**/*.controller.js',
            '**/*.component.js',
            '**/*.js',
            '!**/*.spec.js',
            '!vendor/**/*.js',
            '!**/wip_*.js'
        ], {
            cwd: 'app/'
        }))
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.changed('public/app'))
        .pipe(plugins.if(argv.release, plugins.replace(/\/\/ gulp-inject-debug-mode/g, 'DEBUG_MODE = false;')))
        .pipe(plugins.iife({ useStrict: false, trimCode: false }))
        .pipe(plugins.if(argv.release, plugins.concat('app.js')))
        .pipe(plugins.babel())
        .pipe(plugins.ngAnnotate())
        .pipe(plugins.if(argv.release, plugins.uglify()))
        .pipe(plugins.if(argv.release, plugins.rev()))
        .pipe(plugins.if(argv.release, plugins.sourcemaps.write('./'), plugins.sourcemaps.write()))
        .pipe(gulp.dest('public/app'))
        .pipe(browserSync.stream())
));

gulp.task('build:js:server', () => {
    return gulp.src(['**/*.js'], { cwd: 'server' })
        .pipe(plugins.if(argv.cibuild, plugins.util.noop(), plugins.plumber()))
        .pipe(plugins.changed('dist'))
        .pipe(plugins.babel())
        .pipe(gulp.dest('dist'));
});

gulp.task('build:vendor', () => (
    gulp.src(vendorFiles.initial.concat(vendorFiles.lazy))
        .pipe(plugins.if(argv.cibuild, plugins.util.noop(), plugins.plumber()))
        .pipe(plugins.rename((filePath) => {
            filePath.basename = filePath.basename.replace(/([A-Z])/g, match => `_${match.toLowerCase()}`); // eslint-disable-line
        }))
        .pipe(gulp.dest('public/vendor/'))
        .pipe(browserSync.stream())
));

gulp.task('build:scss', () => (
    gulp.src('app/assets/scss/main.scss')
        .pipe(plugins.inject(gulp.src('app/components/**/*.scss', { read: false }), {
            starttag: '//- inject:{{ext}}',
            endtag: '//- endinject',
            transform: filepath => `@import "${filepath}";`,
            addRootSlash: false
        }))
        .pipe(plugins.sass.sync().on('error', plugins.sass.logError))
        .pipe(plugins.if(argv.cibuild, plugins.util.noop(), plugins.plumber({
            inherit: true
        })))
        .pipe(plugins.autoprefixer(['last 3 versions', 'ie >= 11']))
        .pipe(plugins.if(argv.release, plugins.cleanCss({ compatibility: 'ie11' })))
        .pipe(plugins.if(argv.release, plugins.concat('styles.css'), plugins.concat(`${config.appName}.css`)))
        .pipe(plugins.if(argv.release, plugins.rev()))
        .pipe(gulp.dest(path.join('public/assets/css/')))
        .pipe(browserSync.stream())
));

gulp.task('build:pre:inject', () => (
    gulp.src('app/index.html')
        .pipe(plugins.if(argv.cibuild, plugins.util.noop(), plugins.plumber()))
        .pipe(gulp.dest('public'))
));

gulp.task('build:inject', ['build:pre:inject'], () => {
    // injects 'src' into index.html at position 'tag'
    function inject(src, tag) {
        return plugins.inject(src, {
            starttag: `<!-- inject:${tag}:{{ext}} -->`,
            addRootSlash: false,
            relative: true
        });
    }

    const vendorsBasename = vendorFiles.initial.map((vendor) => {
        const vendorName = path.basename(vendor).replace(/([A-Z])/g, match => `_${match.toLowerCase()}`);
        return `vendor/${vendorName}`;
    });

    const jsFiles = [
        'app.module.js',
        'app.config.js',
        '**/*.module.js',
        '**/*.config.js',
        '**/*.constants.js',
        '**/*.service.js',
        '**/*.factory.js',
        '**/*.js'
    ];

    const scriptFiles = jsFiles.map(file => `app/${file}`);

    scriptFiles.push('!app/vendor/*.js');

    return gulp.src('public/index.html')
        .pipe(plugins.if(argv.cibuild, plugins.util.noop(), plugins.plumber()))
        // inject css
        .pipe(inject(gulp.src('assets/css/*.css', {
            cwd: 'public/',
            read: false
        }), 'app'))
        // inject vendors
        .pipe(inject(gulp.src(vendorsBasename, {
            cwd: 'public/',
            read: false
        }), 'vendor'))
        // inject app.js
        .pipe(inject(gulp.src(scriptFiles, {
            cwd: 'public/',
            read: false
        }), 'app'))
        .pipe(gulp.dest('public/'))
        .pipe(browserSync.stream());
});

gulp.task('test:server', () => {
    process.env.NODE_ENV = 'test';

    return gulp.src('**/*.spec.js', { read: false, cwd: 'server' })
        .pipe(plugins.mocha({
            reporter: 'spec',
            compilers: 'js:babel-core/register',
            bail: argv.cibuild || argv.release,
            watch: argv.watch
        }));
});

gulp.task('watchs', (done) => {
    // Javascript Server
    gulp.watch('**/*.js', { cwd: 'server' }, ['build:js:server']);

    // Javascript Web
    gulp.watch('**/*.js', { cwd: 'app' }, ['build:js:web']);

    // HTML files
    gulp.watch('**/*.html', { cwd: 'app' }, ['build:js:web']);

    // Vendors
    gulp.watch('./vendor.json', ['build:vendor']);

    // index.html
    gulp.watch('app/index.html', ['build:inject']);

    // SCSS
    gulp.watch('**/*.scss', { cwd: 'app' }, ['build:scss']);

    done();
});

gulp.task('nodemon', (done) => {
    plugins.nodemon({
        script: 'dist/server.js',
        watch: [
            'dist'
        ],
        delay: 5,
        ext: 'js json'
    });

    done();
});

gulp.task('browser-sync', (done) => {
    browserSync.init(null, {
        proxy: 'http://localhost:3000',
        browser: 'google chrome',
        port: 3005,
        scrollProportionally: false,
        open: false
    });

    done();
});

gulp.task('build', (done) => {
    runSequence(
        'build:clean',
        'build:js:server',
        'build:js:web',
        'build:scss',
        'build:inject',
        done);
});

gulp.task('debug', (done) => {
    runSequence(
        'build',
        'nodemon',
        'browser-sync',
        'watchs',
        done);
});
