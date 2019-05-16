/* eslint-disable */
if (typeof jQuery === 'undefined') {
  throw new Error("levelPlugin's JavaScript requires jQuery");
}
(function($) {
  $.fn.pull = function(options) {
    var _this = $(this);

    //返回的数据
    var return_data;

    //当前面板
    var levelPanId = 'lpId' + new Date().getTime();
    var _this_lp = null;

    /**
     * 传入参数时NaN则转换为数字0
     * @param {any} val 传入参数
     */
    function isNaNToZero(val) {
      return isNaN(val) ? 0 : val;
    }
    //参数
    var option;
    var title;
    var pan;
    if (options instanceof Array) {
      option = options;
      initHtml();

      title = _this_lp.find('.bksxfed-levelPlugin-pull_t_01');
      pan = _this_lp.find('.bksxfed-levelPlugin-pull_main');

      initClick();
    } else {
      $.ajax({
        url: options.remote,
        type: 'get',
        success: function(d) {
          var data = d;
          var result = options.result;

          var results = result.split('.');
          if (results.length > 1) {
            for (var j = 0; j < results.length; j++) {
              data = data[results[j]];
            }
          } else {
            data = data[result];
          }

          option = data;
          initHtml();

          title = _this_lp.find('.bksxfed-levelPlugin-pull_t_01');
          pan = _this_lp.find('.bksxfed-levelPlugin-pull_main');

          initClick();
        }
      });
    }

    //判断参数是否为空
    if (!option) {
      return;
    }

    //插件样式初始化
    function initHtml() {
      for (var i = 0; i < option.length; i++) {
        option[i]['parentId'] = '';
      }

      //当前元素不可编辑
      _this.attr({ readonly: 'true', unselectable: 'on' });

      $('body').append(
        '<div class="bksxfed-levelPlugin-wrap_pull bksxfed-levelPlugin-pl_display ' +
          levelPanId +
          '"><div class="bksxfed-levelPlugin-pull_title"><div class="bksxfed-levelPlugin-pull_position"><div class="bksxfed-levelPlugin-pull_t_01"></div></div></div><div class="bksxfed-levelPlugin-pull_main" ><div class="bksxfed-levelPlugin-pull_scroll"></div></div></div>'
      );
      _this_lp = $('.' + levelPanId);
      var left = _this.offset().left;
      var top = _this.offset().top;
      var this_outHeight =
        _this.height() +
        parseInt(_this.css('paddingTop')) +
        parseInt(_this.css('paddingBottom')) +
        isNaNToZero(parseInt(_this.css('borderTopWidth'))) +
        isNaNToZero(parseInt(_this.css('borderBottomWidth')));
      var this_outwidth =
        _this.width() +
        parseInt(_this.css('paddingLeft')) +
        parseInt(_this.css('paddingRight'));
      _this_lp.css({
        left: left,
        top: top + this_outHeight,
        width: this_outwidth
      });

      _this_lp
        .find('.bksxfed-levelPlugin-pull_position')
        .css(
          'width',
          _this_lp.width() -
            parseInt(
              _this_lp
                .find('.bksxfed-levelPlugin-pull_position')
                .css('marginLeft')
            ) *
              2
        );
      $(window).resize(function() {
        var left = _this.offset().left;
        var top = _this.offset().top;
        var this_outHeight =
          _this.height() +
          parseInt(_this.css('paddingTop')) +
          parseInt(_this.css('paddingBottom')) +
          isNaNToZero(parseInt(_this.css('borderTopWidth'))) +
          isNaNToZero(parseInt(_this.css('borderBottomWidth')));
        var this_outwidth =
          _this.width() +
          parseInt(_this.css('paddingLeft')) +
          parseInt(_this.css('paddingRight'));
        _this_lp.css({
          left: left,
          top: top + this_outHeight,
          width: this_outwidth
        });
        _this_lp
          .find('.bksxfed-levelPlugin-pull_position')
          .css(
            'width',
            _this_lp.width() -
              parseInt(
                _this_lp
                  .find('.bksxfed-levelPlugin-pull_position')
                  .css('marginLeft')
              ) *
                2
          );
        titleLength();
      });
      initPanTile(option, false);

      title = _this_lp.find('.bksxfed-levelPlugin-pull_t_01');
      pan = _this_lp.find('.bksxfed-levelPlugin-pull_main');
    }

    //修改title和面板的数据
    function initPanTile(arr, move_right) {
      var title = _this_lp.find('.bksxfed-levelPlugin-pull_t_01');
      var pan = _this_lp.find('.bksxfed-levelPlugin-pull_main');
      //为面板添加数据并加data
      pan.children('ul').remove();
      var panUl;
      var this_outwidth =
        _this.width() +
        parseInt(_this.css('paddingLeft')) +
        parseInt(_this.css('paddingRight'));
      if (move_right) {
        panUl = $(
          '<ul style="margin-left:-' + this_outwidth + 'px;"></ul>'
        ).appendTo(pan);
      } else {
        panUl = $(
          '<ul style="margin-left:' + this_outwidth + 'px;"></ul>'
        ).appendTo(pan);
      }

      for (var i = 0; i < arr.length; i++) {
        if (arr[i]['sfky'] === '1' || arr[i]['sfky'] === undefined) {
          $('<li><span>' + arr[i]['name'] + '</span></li>')
            .appendTo(panUl)
            .data('data', arr[i]);
        }
      }
      //判断是否添加全部选项 （如果当前元素的属性‘hasAll’为true 并且不是最外层时，添加全部）
      if (arr[0].parentId !== '' && _this.attr('hasAll') === 'true') {
        addAll();
      }
      if (title.children('span:last').text() !== '请选择') {
        $('<span class="bksxfed-levelPlugin-active">请选择</span>')
          .appendTo(title)
          .data('data', arr);
      }
      panUl.animate({ marginLeft: '0' }, 100);
      if (title.find('span:last').prev('span')) {
        title
          .find('span:last')
          .prev('span')
          .fadeIn(100);
      }
      title.find('span:last').animate({ marginLeft: '10px' }, 100, function() {
        titleLength();
      });

      if (pan.find('li').length > 6) {
        var hei = (pan.height() * pan.height()) / pan.find('ul').height();
        _this_lp
          .find('.bksxfed-levelPlugin-pull_scroll')
          .css('display', 'block')
          .height(hei);
      } else {
        _this_lp
          .find('.bksxfed-levelPlugin-pull_scroll')
          .css('display', 'none');
      }
    }

    function addAll() {
      pan.find('ul').prepend('<li><span>全部</span></li>');
    }

    function interClick(event) {
      //初始化
      if (_this_lp.hasClass('bksxfed-levelPlugin-pl_display')) {
        $('.bksxfed-levelPlugin-wrap_pull').addClass(
          'bksxfed-levelPlugin-pl_display'
        );
        _this_lp.removeClass('bksxfed-levelPlugin-pl_display');
      } else {
        $('.bksxfed-levelPlugin-wrap_pull').addClass(
          'bksxfed-levelPlugin-pl_display'
        );
        _this_lp.addClass('bksxfed-levelPlugin-pl_display');
      }

      if (event.stopPropagation) {
        event.stopPropagation();
      } else if (window.event) {
        window.event.cancelBubble = true;
      }
    }

    //设置title内长度
    function titleLength() {
      var title_warp = _this_lp.find('.bksxfed-levelPlugin-pull_position');
      var spanlength = 0;
      title.children('span').each(function() {
        spanlength += $(this).width();
      });

      title.width(
        spanlength + title.children('span').length * 20 + 1 > title_warp.width()
          ? spanlength + title.children('span').length * 20 + 1
          : title_warp.width()
      );

      if (title.width() <= title_warp.width()) {
        title.css('left', 0);
      }
    }

    //为当前元素赋值
    function setData() {
      var _this_span = '';
      title.children('span').each(function() {
        if ($(this).text() !== '请选择') {
          _this_span += $(this).text();
        }
      });

      var $curEle = title.children('span:nth-last-child(2)');
      var titleAllData = $curEle.data('data');
      if ($.isArray(titleAllData)) {
        for (var i = 0; i < titleAllData.length; i++) {
          if (titleAllData[i].name === $curEle.text()) {
            return_data = titleAllData[i];
          }
        }
      }

      _this.val(_this_span).attr('title', _this_span);

      if (return_data.parentId === '') {
        delete return_data.parentId;
      }
      _this.data('data', return_data);
      titleLength();
      _this_lp.addClass('bksxfed-levelPlugin-pl_display');
    }

    //pan内数据项点击
    function itemClick(event) {
      var data = $(this).data('data');

      $(this)
        .siblings('li')
        .children('span')
        .removeClass('bksxfed-levelPlugin-active');
      $(this)
        .find('span')
        .addClass('bksxfed-levelPlugin-active');

      if ($(this).text() === '全部') {
        if (title.children('.bksxfed-levelPlugin-active').length > 0) {
          title
            .children('.bksxfed-levelPlugin-active')
            .nextAll('span')
            .remove();
        }
        title.children('.bksxfed-levelPlugin-active').text('请选择');
        setData();
      } else {
        if (title.children('span.bksxfed-levelPlugin-active').length > 0) {
          title
            .children('span.bksxfed-levelPlugin-active')
            .text($(this).text());
        } else {
          title.children('span:last').text($(this).text());
        }

        if (title.children('.bksxfed-levelPlugin-active').length > 0) {
          title
            .children('.bksxfed-levelPlugin-active')
            .nextAll('span')
            .remove();
        }
        if (typeof options.remote !== 'undefined') {
          $.ajax({
            url: options.remote,
            data: data.id,
            type: 'get',
            success: function(d) {
              data = d;
              var result = options.result;
              var results = result.split('.');
              if (results.length > 1) {
                for (var j = 0; j < results.length; j++) {
                  data = data[results[j]];
                }
              } else {
                data = data[result];
              }
              if (data.length > 0) {
                title
                  .children('.bksxfed-levelPlugin-active')
                  .removeClass('bksxfed-levelPlugin-active');
                initPanTile(data, false);
                titleLength();
              } else {
                $('<span>请选择</span>').appendTo(title);
                setData();
              }
            }
          });
        } else {
          if (data.children && data.children.length > 0) {
            title
              .children('.bksxfed-levelPlugin-active')
              .removeClass('bksxfed-levelPlugin-active');
            initPanTile(data.children, false);
            titleLength();
          } else {
            $('<span>请选择</span>').appendTo(title);
            setData();
          }
        }
      }

      if (event.stopPropagation) {
        event.stopPropagation();
      } else if (window.event) {
        window.event.cancelBubble = true;
      }
    }

    //title里的数据想点击
    function titleItemClick(thiss) {
      //点击请选择清空元素内容，并返回
      if (thiss.text() === '请选择') {
        _this.val('');
        _this.removeData('data');
        _this.prop('title', '');
        return false;
      }
      //点击当前选中项直接返回
      if (thiss.hasClass('bksxfed-levelPlugin-active')) {
        return false;
      }

      //判断pan是否向右滑动
      var move_right = false;
      thiss.nextAll('span').each(function() {
        if ($(this).hasClass('bksxfed-levelPlugin-active')) {
          move_right = true;
        }
      });

      //title里当前数据项高亮显示
      thiss.siblings('span').removeClass('bksxfed-levelPlugin-active');
      thiss.addClass('bksxfed-levelPlugin-active');

      initPanTile(thiss.data('data'), move_right);

      //pan里当前数据项高亮显示
      pan.find('li').each(function() {
        if (
          $(this)
            .find('span')
            .text() === thiss.text()
        ) {
          $(this)
            .find('span')
            .addClass('bksxfed-levelPlugin-active');
        }
      });

      if (event && event.preventDefault) {
        event.preventDefault();
      } else {
        window.event.returnValue = false; //注意加window
      }
    }

    //tiltle滚动鼠标滑动
    function titleRolldown(event) {
      var title_warp = _this_lp.find('.bksxfed-levelPlugin-pull_position');
      var min_left = title_warp.width() - title.width();
      var move_left = title_left + event.pageX - down_point;
      if (event.pageX < down_point) {
        title.css('left', move_left < min_left ? min_left : move_left);
      } else if (event.pageX > down_point) {
        title.css('left', move_left > 0 ? 0 : move_left);
      }
      if (event && event.preventDefault) {
        event.preventDefault();
      } else {
        window.event.returnValue = false; //注意加window
      }
    }

    //tiltle滚动滚轮滚动
    function titleRollWheel(event) {
      var title_warp = _this_lp.find('.bksxfed-levelPlugin-pull_position');
      var min_left = title_warp.width() - title.width();
      title_left = parseInt($(this).css('left'));
      var e = event || window.event;
      var delta =
        (e.originalEvent.wheelDelta &&
          (e.originalEvent.wheelDelta > 0 ? 1 : -1)) || // chrome & ie
        (e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1)); // firefox
      if (delta > 0) {
        // 向上滚
        title.css(
          'left',
          title_left + delta * 30 > 0 ? 0 : title_left + delta * 30
        );
      } else if (delta < 0) {
        // 向下滚
        title.css(
          'left',
          title_left + delta * 30 > min_left
            ? title_left + delta * 30
            : min_left
        );
      }
      if (event && event.preventDefault) {
        event.preventDefault();
      } else {
        window.event.returnValue = false; //注意加window
      }
    }

    //面板滚轮事件
    function mainRollWheel(event) {
      var e = event || window.event;
      var delta =
        (e.originalEvent.wheelDelta &&
          (e.originalEvent.wheelDelta > 0 ? 1 : -1)) || // chrome & ie
        (e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1)); // firefox
      var ul = _this_lp.find('ul');
      var pan_scroll = _this_lp.find('.bksxfed-levelPlugin-pull_scroll');
      var scroll_max_hei = pan.height() - pan_scroll.height();
      var ul_max_marTop =
        ul.height() + parseInt(ul.css('padding-top')) * 2 - pan.height();
      var pan_marTop = parseInt(pan_scroll.css('top'));
      if (ul.height() > pan.height()) {
        if (delta > 0) {
          pan_scroll.css(
            'top',
            pan_marTop - delta * 10 > 0 ? pan_marTop - delta * 10 : 0
          );
        } else if (delta < 0) {
          // 向下滚
          pan_scroll.css(
            'top',
            pan_marTop - delta * 10 < scroll_max_hei
              ? pan_marTop - delta * 10
              : scroll_max_hei
          );
        }
        ul.css(
          'margin-top',
          ((parseInt(pan_scroll.css('top')) * ul_max_marTop) / scroll_max_hei) *
            -1
        );
      }
      if (event && event.preventDefault) {
        event.preventDefault();
      } else {
        window.event.returnValue = false; //注意加window
      }
    }

    //添加面板滚动条点击事件
    function mainRollscroll(event) {
      var ul = _this_lp.find('ul');
      var pan_scroll = _this_lp.find('.bksxfed-levelPlugin-pull_scroll');
      var move_top = pan_top + event.pageY - pan_down_point;
      var pan_marTop = parseInt(pan_scroll.css('top'));
      var ul_max_marTop =
        ul.height() + parseInt(ul.css('paddingTop')) * 2 - pan.height();
      var scroll_max_hei = pan.height() - pan_scroll.height();
      if (event.pageY < pan_down_point) {
        pan_scroll.css('top', move_top > 0 ? move_top : 0);
      } else if (event.pageX > pan_down_point) {
        pan_scroll.css(
          'top',
          move_top < scroll_max_hei ? move_top : scroll_max_hei
        );
      }
      ul.css(
        'margin-top',
        ((pan_marTop * ul_max_marTop) / scroll_max_hei) * -1
      );

      if (event && event.stopPropagation) {
        event.stopPropagation();
      } else if (window.event) {
        window.event.cancelBubble = true;
      }

      if (event && event.preventDefault) {
        event.preventDefault();
      } else {
        window.event.returnValue = false; //注意加window
      }
    }

    var down_point;
    var title_left;
    var pan_down_point;
    var pan_top;
    function initClick() {
      //点击当前元素时，初始化当前面板
      _this.click(interClick);

      //pan数据项点击
      _this_lp.on('click', '.bksxfed-levelPlugin-pull_main li', itemClick);

      //title数据项点击
      _this_lp.on('mousedown', '.bksxfed-levelPlugin-pull_t_01 span', function(
        event
      ) {
        var span_down_point = event.pageX;
        _this_lp.on('mouseup', '.bksxfed-levelPlugin-pull_t_01 span', function(
          event
        ) {
          if (event.pageX === span_down_point) {
            titleItemClick($(this));
          }
        });
      });

      //当鼠标按下时，title可以拖动

      _this_lp.on('mousedown', '.bksxfed-levelPlugin-pull_t_01', function(
        event
      ) {
        var title_warp = _this_lp.find('.bksxfed-levelPlugin-pull_position');
        down_point = event.pageX;
        title_left = parseInt($(this).css('left'));
        if (title_warp.width() < title.width()) {
          _this_lp.on(
            'mousemove',
            '.bksxfed-levelPlugin-pull_t_01',
            titleRolldown
          );
        }
      });

      //添加面板滚动条拖动事件

      _this_lp.on('mousedown', '.bksxfed-levelPlugin-pull_scroll', function(
        event
      ) {
        var ul = _this_lp.find('ul');
        pan_down_point = event.pageY;
        pan_top = parseInt($(this).css('top'));
        if (ul.height() > pan.height()) {
          $(document).on('mousemove', mainRollscroll);
        }
        if (event.stopPropagation) {
          event.stopPropagation();
        } else if (window.event) {
          window.event.cancelBubble = true;
        }
      });

      //位pull_t_01添加阻止冒泡事件
      _this_lp.on('click', '.bksxfed-levelPlugin-pull_t_01', function(event) {
        if (event.stopPropagation) {
          event.stopPropagation();
        } else if (window.event) {
          window.event.cancelBubble = true;
        }
      });

      //位pull_main添加阻止冒泡事件
      _this_lp.on('click', '.bksxfed-levelPlugin-pull_main', function(event) {
        if (event.stopPropagation) {
          event.stopPropagation();
        } else if (window.event) {
          window.event.cancelBubble = true;
        }
      });

      //添加title鼠标滚轮事件
      $(document).on(
        'mousewheel DOMMouseScroll',
        '.bksxfed-levelPlugin-pull_t_01',
        titleRollWheel
      );

      //添加面板鼠标滚轮事件
      $(document).on(
        'mousewheel DOMMouseScroll',
        '.bksxfed-levelPlugin-pull_main',
        mainRollWheel
      );

      //当鼠标放开时，解绑鼠标移动事件
      $(document).on('mouseup', function() {
        _this_lp.off(
          'mousemove',
          '.bksxfed-levelPlugin-pull_t_01',
          titleRolldown
        );
        $(document).off('mousemove');
      });

      //鼠标点击其他地方，隐藏面板
      $(document).click(function(event) {
        _this_lp.addClass('bksxfed-levelPlugin-pl_display');

        if (event.stopPropagation) {
          event.stopPropagation();
        } else if (window.event) {
          window.event.cancelBubble = true;
        }
      });
    }
  };
})($);
