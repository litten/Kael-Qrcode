// 包装函数
module.exports = function(grunt) {
	//目录设定
	var _config = {
		srcPath: 'src/',
		buildPath: 'build/'
	};
	// 任务配置
	grunt.initConfig({
		cfg: _config,
		uglify: {
			dev: {
				files: {
					'<%= cfg.buildPath %>kaelQrcode.min.js': ['<%= cfg.srcPath %>*.js']
				}
			}
		},
		watch: {
			all: {
				files: ['<%= cfg.srcPath %>*.js',],
				tasks: ['uglify:dev']
			}
		}
	});

	// 任务加载
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// 自定义任务
	grunt.registerTask('default', ['uglify:dev']);
	grunt.registerTask('dev', ['uglify:dev','watch']);
};