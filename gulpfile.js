const gulp = require('gulp');
const babel = require('gulp-babel');
const fs = require('fs');

gulp.task('server', function () {
  fs.existsSync("build") || fs.mkdirSync("build");
  gulp.src('src/server/*.js')
    .pipe(babel())
    .pipe(gulp.dest('build'));
});

gulp.task('watch', function() {
  gulp.watch('src/server/*.js', ['server'])
});

gulp.task('default', ['server', 'watch']);