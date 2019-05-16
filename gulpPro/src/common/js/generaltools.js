// 判断jquery有没有加载
if (typeof jQuery === 'undefined') {
	alert('使用generatorTool请加载jquery');
	throw new Error('generatorTool\'s JavaScript requires jQuery');
}

// console.log 兼容
var console = window.console || {
	log: function () {}
};

(function (window, $) {
	var returnManage = undefined;
	// 请求方法
	function getData() {
		var _ajax = $.ajax;

		$.ajax = function (opt) {
			if (opt.type == 'post' || opt.type == 'put' && $('.save_pop_sure').length == 0) {
				$('body').append('<div class="save_pop_sure">' +
					'<div class="save_pop_bg"></div>' +
					'<div class="save_pop_content"></div>' +
					'</div>');
			}

			var temp = opt.temp; // template

			var tempHtml = $(temp).find('script').eq(0);

			var scriptPar = tempHtml.parent();

			var beforeInit = opt.beforeInit || '';

			if (tempHtml.length > 0) {
				scriptPar.data('template', tempHtml.html());

				$(temp).data('scriptPar', scriptPar);
			}


			// fn is callBack with error and success
			var fn = {

				error: function (jqXHR, textStatus, errorThrown) {},

				success: function (data, textStatus, jqXHR) {}
			};


			if (opt.error) {
				fn.error = opt.error;
			}

			if (opt.success) {
				fn.success = opt.success;
			}

			// deal with request data parameters
			var parameterStr = '';

			if (typeof opt.data === 'object') {
				if (/delete/igm.test(opt.type) || /get/igm.test(opt.type) || opt.type == '' || opt.type == undefined) {
					var parameters = opt.data;

					for (var key in parameters) {
						parameterStr += key + '=' + encodeURI(parameters[key]) + '&';
					}

					parameterStr = parameterStr.substr(0, parameterStr.length - 1);

					if (!/\?/igm.test(opt.url)) {
						opt.url += '?' + parameterStr;

						opt.data = '';
					} else {
						opt.url += '&' + parameterStr;

						opt.data = '';
					}
				} else {
					opt.data = JSON.stringify(opt.data);
				}
			}


			// let customize ajax function inherit jquery's ajax function
			var _opt = $.extend(opt, {
				contentType: 'application/json;charset=UTF-8',
				error: function (jqXHR, textStatus, errorThrown) {
					$('.save_pop_sure').remove();
					var ret = fn.error(jqXHR, textStatus, errorThrown);
					if (ret === undefined || ret === true) {
						if (jqXHR.status === 'undefined') {
							return false;
						}
						// (jqXHR.responseText);
					}
				},
				success: function (data, textStatus, jqXHR) {
					var data = data;
					if (beforeInit && typeof beforeInit === 'function') {
						var formatData = beforeInit(data);

						if (typeof formatData === 'boolean' && formatData) {
							return data;
						}

						if (formatData) {
							data = formatData;
						}
					}


					$('.save_pop_sure').remove();
					if (returnManage) {
						if (returnManage(data, textStatus, jqXHR) == false) {
							return false;
						}
					}


					if (data) {
						if (data.id_token) {
							sessionStorage.setItem('id_token', data.id_token);

							$.ajaxSetup({

								headers: {
									'Authorization': 'Bearer ' + sessionStorage.getItem('id_token')
								}
							});
						}
						if (temp) {
							if ($(temp).data('scriptPar').data('template')) {
								var render = template.compile($(temp).data('scriptPar').data('template'));
								$(temp).data('scriptPar').html(render({
									data: data
								}));
							}
						}
					}

					fn.success(data, textStatus, jqXHR);
				}
			});

			return _ajax(_opt);
		};
	}

	// 分页方法
	function page() {
		$.fn.pageTool = function (obj) {
			// if the obj is undefined return
			if (!obj) {
				return false;
			}


			var url = obj.url; // url

			if (!url) {
				console.log('分页方法调用缺少url');
				return false;
			}

			var _this = $(this);

			var pageSize = obj.pageSize || 10; // pageSize

			var parameter = obj.data || {};

			var afterInit = obj.afterInit;

			var beforeInit = obj.beforeInit;

			var currentPage = 1;

			var maxPage;

			var temp;

			var changeEle;

			if (_this.find('script').length === 0 && !_this.data('pageTemplate')) {
				alert('请检查模版(script)');

				return false;
			}

			temp = _this.find('script').eq(0);

			if (temp.length > 0) {
				_this.data('changeEle', temp.parent());
				changeEle = temp.parent();
			} else {
				changeEle = _this.data('changeEle');
			}


			_this.data('pageTemplate', temp.html());


			// list init
			function initList() {
				return getData().done(function (data) {

					if (beforeInit && typeof beforeInit === 'function') {

						var formatDate = beforeInit(data);
						if (formatDate) {
							return formatDate;
						}
						return data;

					} else {
						return data;
					}

				}).done(function (data, textStatus, jqXHR) {
					maxPage = parseInt(data.pageCount);
					// 模板
					var render = template.compile(_this.data('pageTemplate'));


					var arrA = obj.locator.split('.');
					var ddd = data;
					for (var i = 0; i < arrA.length; i++) {
						ddd = ddd[arrA[i]];
					}

					if (returnManage) {
						if (returnManage(data, textStatus, jqXHR) == false) {
							return false;
						}
					}
					changeEle.html(render({
						wrapData: data,
						data: ddd
					}));

					initPageItem(data);
					if (parseInt(data.rowsCount) === 0) {
						_this.find('.pageTool,.list_nodata').remove();
						_this.find('.noneData').remove();
						// changeEle.empty();
						_this.append('<div class="noneData">没有符合的数据！</div>');

						// return data;
					}
					return data;
				}).done(function (data) {
					if (afterInit && typeof afterInit === 'function') {
						afterInit();
					}

					if (typeof obj.callback === 'function') {
						obj.callback(data);
					}
					return data;
				}).fail(function () {
					console.log('请求数据失败');
				});
			}

			// pageItem init
			function initPageItem(data) {
				_this.find('.pageTool').remove();
				_this.find('.noneData').remove();

				var prevDis = '';
				var nextDis = '';

				if (currentPage === 1) {
					prevDis = 'disclick';
				}

				if (currentPage === maxPage) {
					nextDis = 'disclick';
				}


				var pageStr = '<div class="pageTool">' +
					'<div class="pageTool_left">共' + data.rowsCount + '条信息</div>' +
					'<div class="pageTool_right">' +
					'<span class="pageTool_previous ' + prevDis + '"><上一页</span>' +
					'<div class="wrap_pageItem">' +
					// list page item
					'</div>' +
					'<span class="pageTool_next ' + nextDis + '">下一页></span>' +
					'<select class="pageTool_select">' +
					// list page item
					'</select>' +
					'<span class="pageToolJump">跳转到第</span>' +
					'<input type="text" class="pageToolText"/>' +
					'<span class="pageToolJump">页</span>' +
					'</div>' +
					'</div>';


				_this.append(pageStr);

				var wrapItem = _this.find('.pageTool .wrap_pageItem');
				var select = _this.find('.pageTool .pageTool_select');

				var len = parseInt(data.pageCount);

				for (var j = 1; j <= len; j++) {
					var selStr = '';

					if (j === currentPage) {
						selStr = 'selected';
					}

					// select.append('<option value="' + j + '" ' + selStr + '>第' + j + '页</option>');
				}

				var currStr = '';
				if (len <= 6) {
					for (var i = 1; i <= len; i++) {
						if (i === currentPage) {
							currStr = ' class="pageTool_currentPage"';
						} else {
							currStr = '';
						}
						wrapItem.append('<span ' + currStr + '>' + i + '</span>');
					}
				} else if (currentPage < 4) {

					for (var m = 1; m <= 4; m++) {

						if (m === currentPage) {
							currStr = ' class="pageTool_currentPage"';
						} else {
							currStr = '';
						}

						wrapItem.append('<span' + currStr + '>' + m + '</span>');
					}

					if (len >= 7) {
						wrapItem.append('<span>...</span>');
					}

					wrapItem.append('<span>' + len + '</span>');
				} else {

					if (currentPage > (len - 4)) {

						wrapItem.append('<span>1</span><span>...</span>');

						if (currentPage === (len - 3)) {

							wrapItem.append('<span class="pageTool_currentPage">' + currentPage + '</span>');

							wrapItem.append('<span>' + (currentPage + 1) + '</span>');

							wrapItem.append('<span>...</span>');

							wrapItem.append('<span>' + len + '</span>');


						} else {
							for (var k = 3; k >= 0; k--) {

								if ((len - k) === currentPage) {
									currStr = ' class="pageTool_currentPage"';
								} else {
									currStr = '';
								}

								wrapItem.append('<span ' + currStr + '>' + (len - k) + '</span>');
							}
						}

					} else {

						wrapItem.append('<span>1</span><span>...</span><span class="pageTool_currentPage">' + currentPage + '</span>');

						if ((currentPage + 1) < len) {

							wrapItem.append('<span>' + (currentPage + 1) + '</span>');
						}

						if ((currentPage + 2) < len) {
							wrapItem.append('<span>...</span>');
						}

						wrapItem.append('<span>' + len + '</span>');
					}


				}

				enevtBind();
			}


			// get data
			function getData() {
				if (!parameter.pageSize) {
					parameter.pageSize = pageSize;
				}

				parameter.pageNum = currentPage;
				return $.fetch({
          'url': url,
          type: obj.type,
					'data': parameter
				});
			}


			// event
			// previousPage
			function previousPage() {
				if (currentPage === 1) {
					return false;
				}

				currentPage = currentPage - 1;

				initList();
			}

			// nextPage
			function nextPage() {
				if ((currentPage + 1) > maxPage) {
					return false;
				}

				currentPage = currentPage + 1;

				initList();
			}

			function itemPage() {
        var nowValue = parseInt($(this).text());
        // 当前行
        if (currentPage === nowValue) {
					return;
        }
        // ... 的情况
        if (!nowValue && nowValue != 0) {
          return;
        }
        currentPage = nowValue || currentPage;

				if (!isNaN(currentPage)) {
					initList();
				}
			}


			function goPage() {
				var pageToolText = $(this);
				if (event.keyCode === 13) {
					if (parseInt($(this).val()) > maxPage) {
						currentPage = maxPage;
						initList().then(function () {
							_this.find('.pageTool .pageToolText').val(currentPage);
						}).fail(function () {
							console.log('请求数据失败');
						});
					} else if (parseInt($(this).val()) < 1) {
						currentPage = 1;
						initList().then(function () {
							_this.find('.pageTool .pageToolText').val(1);
						}).fail(function () {
							console.log('请求数据失败');
						});
					} else if (parseInt($(this).val()) === currentPage) {
						return false;
					} else {
						currentPage = parseInt(pageToolText.val());
						initList().then(function () {
							_this.find('.pageTool .pageToolText').val(currentPage);
						}).fail(function () {
							console.log('请求数据失败');
						});
					}
				}
			}

			function selectPage() {
				currentPage = parseInt($(this).val());

				initList();
			}


			// bind event

			function enevtBind() {
				$('.pageTool .pageTool_previous', _this).unbind('click', previousPage);
				$('.pageTool .pageTool_previous', _this).bind('click', previousPage);

				$('.pageTool .pageTool_next', _this).unbind('click', nextPage);
				$('.pageTool .pageTool_next', _this).bind('click', '.pageTool .pageTool_next', nextPage);


				$('.pageTool .wrap_pageItem > span', _this).unbind('click', itemPage);
				$('.pageTool .wrap_pageItem > span', _this).bind('click', itemPage);

				$('.pageTool .pageToolText', _this).unbind('keydown', goPage);
				$('.pageTool .pageToolText', _this).bind('keydown', goPage);

				$('.pageTool .pageTool_select', _this).unbind('change', selectPage);
				$('.pageTool .pageTool_select', _this).bind('change', selectPage);
			}
			initList();
		};
	}

	// 请求执行
	getData();

	// 分页执行
	page();
})(window, $);
