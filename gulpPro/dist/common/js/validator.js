/* eslint-disable */
//文档加载完毕,开始初始化
$(document).ready(function() {
  loadValid();
});
//==============================================================================//
//各自定义属性名的初始化														//
//==============================================================================//

var _init_money_jqws_name = 'jqws'; //自动转化金额时,精确位数的标示,同时也是自动绑定该方法的标示(不是有效正整数,则默认为2位有效数字)
var _init_validate_flag_name = 'valiflag'; //表单校验时,指定校验规则的属性名
var _init_validate_validate = 'validate'; //表单校验类型(值为:blur或者submit)
var _init_right_move = 'mustright'; //设置必须输入正确才能离开(在需要失去焦点跳转时或者form的validate属性设置为blur时候有效)
var _init_validate_msgtype_name = 'msgtype'; //表单校验时,指定提示信息类型的属性名(值为:1.alert提示,2.右侧文字提示)
var _init_validate_msg_value = 'error_info'; //右侧提示信息的span标签的name属性值
var _init_validate_relation_name = 'relation'; //表单校验时,设置有效性校验的属性名
var _init_validate_relation_msg_name = 'relmsg'; //表单校验时,设置有效性的提示信息
var _init_validate_reg_msg_name = 'regmsg'; //表单校验时,正则表达式不成立的自定义提示信息
var customMethod = new Array();
//==============================================================================//
//初始化方法,在此设置															//
//==============================================================================//
function loadValid() {
  _init_loadjy(); // 初始化校验事件
}
//==============================================================================//
//判断是否需要加载失去焦点进行校验,如果需要,则加载,否则 跳过				    //
//==============================================================================//
var _this_input_is_right = true; //失去焦点校验时,这个文本框是否成功
var _default_value_array = new Array();
var _default_value_blur = new Array();
var _default_blurinput_value = '';

function _init_loadjy() {
  for (
    var kk = 0; kk < $('[' + _init_validate_validate + ']').length + 1; kk++
  ) {
    _default_value_blur[kk] = '-';
    _default_value_array[kk] = '-';
  }
  $('[' + _init_validate_validate + ']').each(function(i) {
    var _validate = $(this).attr(_init_validate_validate);
    if (_validate == 'blur') {
      var _form_name = $(this).attr('name');

      $(
        "form[name='" + _form_name + "'] [" + _init_validate_flag_name + ']'
      ).each(function(i) {
        if ($(this).attr('disabled') + '' != 'disabled') {
          $(this).focusout(function() {
            _this_input_is_right = _on_blur_validate(
              _form_name,
              $(this),
              'normal',
              i
            );
          });
          $(this).focus(function(i) {
            var _this_config = _validate_loadconfig(
              $("form[name='" + _form_name + "']")
            );
            if (_this_config[0] + '' == '2') {
              _auto_msg_rightline_clear_by_input($(this));
            }
          });
          $(this)
            .children('p')
            .click(function(i) {
              _auto_msg_rightline_clear_by_input($(this));
            });
        }
      });
    }
  });
}

//失去焦点时候,执行的校验
function _on_blur_validate(_form_name, _input, _type, _index) {
  var _this_config = _validate_loadconfig($("form[name='" + _form_name + "']"));
  var _msg = '';
  var _validate_type = '';
  var _data_max_length = '';
  var _data_min_length = '';
  _validate_flag = _input.attr(_init_validate_flag_name);
  var _validate_properties = _validate_flag.split(',');
  _data_max_length = _validate_properties[0]; //最大长度
  _data_min_length = _validate_properties[3]; //最小长度
  _validate_type = _validate_properties[1]; //校验类型
  _msg = _validate_properties[2]; //提示信息
  var _is_canbe_empty = _input.attr('v_require'); //是否为空
  if (
    _is_canbe_empty + '' == 'undefined' ||
    _to_trim_all(_is_canbe_empty) == ''
  ) {
    var _star_index = _input.attr('v_require');
    _is_canbe_empty = 'true';
    if (_star_index + '' != 'undefined') {
      _is_canbe_empty = 'false';
    }
  }
  //如果提示信息为空,则默认查找文本框前的文字
  if (_msg + '' == 'undefined' || _to_trim_all(_msg) == '') {
    _msg = '';
    //_msg=_get_the_msg(_input);
  }
  if (_is_number(_data_max_length) == false) {
    _data_max_length = -1;
  }
  if (_is_number(_data_min_length) == false) {
    _data_min_length = -1;
  }

  //alert提示.则只在值改变时才进行校验
  if (_this_config[0] == '1') {
    //如果值等于之前的值,则不进行校验
    var default_value = _default_value_array[_index];
    if (_type == 'tz') {
      default_value = _default_value_blur[_index];
    }
    if (default_value == undefined) {
      default_value = '';
    }
    if (_input.attr(_init_right_move) + '' == 'undefined') {
      if (_input.val() == default_value) {
        return false;
      }
    }

    if (_type == 'tz') {
      _default_value_blur[_index] = _input.val();
    } else {
      _default_value_array[_index] = _input.val();
    }
  }
  //校验
  var _is_right = _get_validate_result(
    _input,
    _msg,
    _data_max_length,
    _data_min_length,
    _validate_type,
    _is_canbe_empty,
    _this_config
  );
  return _is_right;
}
//==============================================================================//
//加载校验的配置信息   														    //
//==============================================================================//
function _validate_loadconfig(_validate_form) {
  var _msg_type = '';
  var _msg_color = '';
  //加载提示类型,如果没有设置,则默认为alert提示
  if ($('[' + _init_validate_msgtype_name + ']').length == 0) {
    _msg_type = '1';
    return new Array(_this_config[0]);
  }
  var _msg_type_temp = $('[' + _init_validate_msgtype_name + ']')
    .attr(_init_validate_msgtype_name)
    .split(',');
  if (_msg_type_temp[0] == '2') {
    _msg_type = '2';
    var _valiedate_color = _to_trim_all(_msg_type_temp[1]);
    if (_valiedate_color + '' != 'undefined' && _valiedate_color != '') {
      _msg_color = _valiedate_color;
    } else {
      _msg_color = '#FF0000'; //默认为红色
    }
  } else {
    _msg_type = '1';
  }
  return new Array(_msg_type, _msg_color);
}

//==============================================================================//
//表单校验	(datalength值如果不是自然数,则不进行任何校验)						//
//==============================================================================//

function validate(_form_name) {
  //如果没有指定格式的,则跳过校验
  if (
    $("form[name='" + _form_name + "'] [" + _init_validate_flag_name + ']')
    .length == 0
  ) {
    alert(
      '401:请确定是否正确指定了格式[即:' + _init_validate_flag_name + '属性]!'
    );
    return false;
  }
  //清空之前的提示信息
  _auto_msg_rightline_clear($("form[name='" + _form_name + "']"));
  //加载配置信息
  var _this_config = _validate_loadconfig($("form[name='" + _form_name + "']"));
  var _msg = '';
  var _validate_type = '';
  var _data_max_length = '';
  var _data_min_length = '';
  var _is_right = true;
  $("form[name='" + _form_name + "'] [" + _init_validate_flag_name + ']').each(
    function(i) {
      _validate_flag = $(this).attr(_init_validate_flag_name);
      var _validate_properties = _validate_flag.split(',');
      _data_max_length = _validate_properties[0];
      _data_min_length = _validate_properties[3];
      _validate_type = _validate_properties[1];
      _msg = _validate_properties[2];
      var _is_canbe_empty = $(this).attr('v_require');
      if (_msg + '' == 'undefined' || _to_trim_all(_msg) == '') {
        _msg = '';
      }
      if (_is_number(_data_max_length) == false) {
        _data_max_length = -1;
      }
      if (_is_number(_data_min_length) == false) {
        _data_min_length = -1;
      }
      if (
        _is_canbe_empty + '' == 'undefined' ||
        _to_trim_all(_is_canbe_empty) == ''
      ) {
        var _star_index = $(this).attr('v_require');
        _is_canbe_empty = 'true';
        if (_star_index + '' != 'undefined') {
          _is_canbe_empty = 'false';
        }
      }
      _default_value_array[i] = $(this).val();
      //校验
      var _this_is_right = _get_validate_result(
        $(this),
        _msg,
        _data_max_length,
        _data_min_length,
        _validate_type,
        _is_canbe_empty,
        _this_config
      );
      if (_this_is_right == false) {
        _is_right = false;
        if (_this_config[0] == '1') {
          return false;
        }
      }
    }
  );
  return _is_right;
}
//默认的校验,包含,非空,非法字符,长度
function _get_validate_result(
  _input,
  _msg,
  _data_max_length,
  _data_min_length,
  _validate_type,
  _is_canbe_empty,
  _this_config
) {
  var _input_value = _input.val();
  if (_input.hasClass('Select')) {
    _input_value = _input.children('p').attr('data');
  }
  //校验开始,验证是否为空
  if (_is_canbe_empty == 'false') {
    if (_to_trim_all(_input_value) == '') {
      var showmsg = _msg + '不能为空!';

      if (_input.find('li').length > 0) {
        showmsg = '请选择' + _msg + '!';
        _input = _input.children('p');
      }

      _auto_showmsg(_input, showmsg, _this_config);
      return false;
    }
  }
  if (
    _validate_type + '' == 'undefined' ||
    _to_trim_all(_validate_type) == ''
  ) {
    //验证是否有非法字符
    if (_auto_validate_ffzf(_input, _msg, 'full', _this_config) == false) {
      return false;
    }
  } else {
    var _validate_type_array = _validate_type.split(' ');
    var _the_validate_is_right = 'true';
    for (var i = 0; i < _validate_type_array.length; i = i + 1) {
      //指定类型的校验
      if (_to_trim_all(_validate_type_array[i]) == '') {
        continue;
      }
      if (
        _auto_validate_by_type(
          _input,
          _msg,
          _data_max_length,
          _data_min_length,
          _to_trim_all(_validate_type_array[i]),
          _this_config
        ) == false
      ) {
        _the_validate_is_right = 'false';
        return false;
      }
    }
    if (_the_validate_is_right == 'false') {
      return false;
    }
  }

  //验证长度是否超限
  if (
    _check_length(
      _input,
      _msg,
      _data_max_length,
      _data_min_length,
      _this_config
    ) == false
  ) {
    return false;
  }
  var _relation = _input.attr(_init_validate_relation_name);
  //验证有效性
  if (_relation + '' != 'undefined' && _to_trim_all(_relation) != '') {
    if (_check_relation(_input, _msg, _this_config) == false) {
      return false;
    }
  }
  return true;
}

//检查有效性
function _check_relation(_input, _msg, _this_config) {
  var _relation = _input.attr(_init_validate_relation_name);
  var _new_relation = _relation;
  var _relation_exps = new Array(); //存放每一个表达式
  var _relation_result = new Array(); //每个表达式的成立结果
  var _relation_andor = new Array(); //存放逻辑表达式
  var _andor_temp = _is_setting_andOr(_new_relation, 'andor');
  var _temp_i = 0;
  //设置逻辑表达式
  while (_andor_temp != '') {
    //设置逻辑字符
    _relation_andor[_temp_i] = _andor_temp;
    //获取逻辑字符前的表达式
    _relation_exps[_temp_i] = _new_relation.substring(
      0,
      _new_relation.indexOf(_andor_temp)
    );
    _new_relation = _new_relation.substring(
      _new_relation.indexOf(_andor_temp) + _andor_temp.length
    );
    _temp_i++;
    _andor_temp = _is_setting_andOr(_new_relation, 'andor');
  }
  _relation_exps[_temp_i] = _new_relation;

  //校验所有的表达式
  for (var i = 0; i < _relation_exps.length; i++) {
    _relation_result[i] = _the_exp_is_right(_input, _relation_exps[i], _msg);
  }
  var _is_right_result = _relation_result[0];
  //根据表达式校验结果,验证逻辑表达式
  for (var i = 0; i < _relation_andor.length; i++) {
    if (_relation_andor[i] == 'and') {
      if (_is_right_result == true && _relation_result[i + 1] == true) {
        _is_right_result = true;
      } else {
        _is_right_result = false;
      }
    } else {
      if (_is_right_result == true || _relation_result[i + 1] == true) {
        _is_right_result = true;
      } else {
        _is_right_result = false;
      }
    }
  }

  if (_is_right_result == false) {
    var _show_msg = _input.attr(_init_validate_relation_msg_name);
    if (_to_trim_all(_show_msg) == '' || _show_msg + '' == 'undefined') {
      _show_msg = _msg + '的值不符合表达式条件!';
    }
    _auto_showmsg(_input, _show_msg, _this_config);
    return false;
  }
  return true;
}

//判断该表达式是否成立
function _the_exp_is_right(_input, _relation_exp, _msg) {
  var _relation = $.trim(_relation_exp);
  var _relation_temp = _relation.split(' ');
  var _the_relation = _to_trim_all(_relation_temp[0]).toLowerCase();
  var _input_value = (_input.val() + '').replace(/-/g, '');
  if (_input_value == '') {
    return true;
  }
  var _value_or_name = _relation_temp[2] + '';
  var _the_value = _to_trim_all((_relation_temp[1] + '').replace(/-/g, ''));
  var _the_msg = '[' + _the_value + ']'; //另一个文本框的提示信息,默认是值
  _the_value = _the_value.replace(/_/g, '');
  if (_the_value == '') {
    return true;
  }
  if (_value_or_name == 'val') {} else if (_value_or_name == 'exp') {
    var _exp_values = new Array(); //每个值
    var _exp_char = new Array(); //符号(+或者-)
    var _exp = _relation_temp[1];
    var _temp_exp_char = _is_setting_andOr(_exp, '+-');
    var _temp_i = 0;
    while (_temp_exp_char != '') {
      _exp_char[_temp_i] = _temp_exp_char;
      _exp_values[_temp_i] = _exp.substring(0, _exp.indexOf(_temp_exp_char));
      _temp_i++;
      _exp = _exp.substring(
        _exp.indexOf(_temp_exp_char) + _temp_exp_char.length
      );
      _temp_exp_char = _is_setting_andOr(_exp, '+-');
    }
    _exp_values[_temp_i] = _exp;

    //处理值的表达式
    var _value_result_temp = _get_value_by_name(_exp_values[0]);
    if (_value_result_temp == '') {
      return true;
    }
    if (_value_result_temp == 'false') {
      alert('508:' + _msg + '的表达式中,存在非值类型!');
      return false;
    }
    var _value_result = parseFloat(_value_result_temp);
    var _value_temp = '';
    for (var i = 0; i < _exp_char.length; i++) {
      _value_temp = _get_value_by_name(_exp_values[i + 1]);
      if (_value_result_temp == '') {
        return true;
      }
      if (_value_result_temp == 'false') {
        alert('509:' + _msg + '的表达式中,存在非值类型!');
        return false;
      }
      if (_exp_char[i] == '+') {
        _value_result = _value_result + parseFloat(_value_temp);
      } else {
        _value_result = _value_result - parseFloat(_value_temp);
      }
    }
    _the_value = _value_result + '';
  } else if (_value_or_name == 'name' || _is_money(_the_value) == false) {
    var _name_temp = _the_value;
    _the_value = _to_trim_all(
      ($("[name='" + _name_temp + "']").val() + '').replace(/-/g, '')
    );
    if (_the_value == '') {
      return true;
    }
  }
  if (
    '[eq][nq][con][ncon][==][!=][^][!^]'.indexOf('[' + _the_relation + ']') ==
    -1
  ) {
    _the_value = _the_value.replace(/_/g, '');
    if (_the_value == '') {
      return true;
    }
    if (_the_value == undefined) {
      alert(
        '500:' +
        _msg +
        '的' +
        _init_validate_relation_name +
        '属性设置有误,请检查指定文本框name属性是否正确!'
      );
      return false;
    }
    if (_is_money(_the_value) == false) {
      alert(
        '510:' +
        _msg +
        '的' +
        _init_validate_relation_name +
        '属性设置有误,请检查语法格式是否符合规范!'
      );
      return false;
    }
  }
  //长度与要比较的值保持一致
  var _is_right = _is_right_relation(
    _the_relation,
    _input,
    _the_value,
    _msg,
    _the_msg
  );
  if (_is_right == 'thistypeisnotfind') {
    alert(
      '511:' +
      _msg +
      '的' +
      _init_validate_relation_name +
      '属性设置有误,请检查关系运算符是否设置正确!'
    );
    return false;
  }
  return _is_right;
}
//根据参数获取值,如果参数本身是值,则返回其本身,否则返回对应name的input的值
function _get_value_by_name(valname) {
  if (_is_money(valname) == false) {
    var _value = $("[name='" + valname + "']").val();
    _value = _value.replace(/-/g, '');
    if (_value == '' || _value + '' == 'undefined') {
      return '';
    }
    if (_is_money(_value) == false) {
      return 'false';
    }
    return $("[name='" + valname + "']").val();
  }
  return valname;
}

//是否设置了and或者or(+号或者-号),并返回第一个逻辑表达符号
function _is_setting_andOr(_relation_value, _type) {
  var _the_char = new Array('and', 'or');
  if (_type == '+-') {
    _the_char = new Array('+', '-');
  }
  var _index_temp_and = _relation_value.indexOf(_the_char[0]);
  var _index_temp_or = _relation_value.indexOf(_the_char[1]);
  if (_index_temp_and == -1 && _index_temp_or == -1) {
    return '';
  }
  if (_index_temp_and != -1 && _index_temp_or == -1) {
    return _the_char[0];
  }
  if (_index_temp_and == -1 && _index_temp_or != -1) {
    return _the_char[1];
  }
  return _index_temp_and < _index_temp_or ? _the_char[0] : _the_char[1];
}

//根据设置的有效性,检查是否符合
function _is_right_relation(_the_relation, _input, _the_value, _msg, _the_msg) {
  var _is_right = true;
  var _input_value = _to_trim_all(_input.val() + '');
  var _relation = _to_trim_all(_the_relation);
  var _msg_temp = '';
  switch (_relation.toLowerCase()) {
    case 'eq':
    case '==':
      _is_right = _input_value == _the_value;
      _msg_temp = '等于';
      break;
    case 'ge':
    case '>=':
      _is_right = parseFloat(_input_value) >= parseFloat(_the_value);
      _msg_temp = '大于或等于';
      break;
    case 'le':
    case '<=':
      _is_right = parseFloat(_input_value) <= parseFloat(_the_value);
      _msg_temp = '小于或等于';
      break;
    case 'gt':
    case '>':
      _is_right = parseFloat(_input_value) > parseFloat(_the_value);
      _msg_temp = '大于';
      break;
    case 'lt':
    case '<':
      _is_right = parseFloat(_input_value) < parseFloat(_the_value);
      _msg_temp = '小于';
      break;
    case 'nq':
    case '!=':
      _is_right = _input_value != _the_value;
      _msg_temp = '不等于';
      break;
    case 'con':
    case '^':
      var _index_temp = _input_value.indexOf(_the_value);
      _is_right = _index_temp != -1;
      _msg_temp = '包含';
      break;
    case 'ncon':
    case '!^':
      var _index_temp = _input_value.indexOf(_the_value);
      _is_right = _index_temp == -1;
      _msg_temp = '不包含';
      break;
    default:
      _is_right = false;
      _msg_temp = 'thistypeisnotfind';
  }
  return _is_right;
}

//验证非法字符
//full类型 0616增加#
var _ffzf_full = new Array(
  ':',
  '?',
  '"',
  '[',
  ']',
  '{',
  '}',
  '`',
  '=',
  '#',
  '^',
  '&',
  '!',
  '*',
  '|',
  ';',
  '$',
  '%',
  '@',
  "'",
  '<',
  '>',
  '(',
  ')',
  '+',
  '\r',
  '\n',
  ',',
  '\\',
  '../',
  ' '
);
var _ffzf_normal = new Array(
  '|',
  ';',
  '$',
  '%',
  "'",
  '<',
  '>',
  '`',
  '(',
  ')',
  '+',
  '\r',
  '\n',
  ',',
  '\\',
  '../',
  ' ',
  '*'
);
var _ffzf_less = new Array();
var _ffzf_basic = new Array("'", '--', "'--", '/*', '*/', '||', '"');
var _ffdc_normal = new Array('chr(39)', 'null'); //"and ","or ","insert ","select ","delete ","drop ","update "," count"," master","truncate ","declare ");
function _auto_validate_ffzf(_input, _msg, _type, _this_config) {
  var _input_value = _input.val();
  if (_input_value != '') {
    var _reg_ffzf = _ffzf_full;
    if (_type == 'normal') {
      _reg_ffzf = _ffzf_normal;
    } else if (_type == 'less') {
      _reg_ffzf = _ffzf_less;
    } else if (_type != 'full' && _to_trim_all(_type) != '') {
      _reg_ffzf = _get_validate_type(_type);
    }
    var _msg_ffzf = '';
    //基本字符校验
    for (var k = 0; k < _ffzf_basic.length; k++) {
      if (_input_value.indexOf(_ffzf_basic[k]) != -1) {
        _msg_ffzf = _ffzf_basic[k];
        if (_ffzf_basic[k] == ' ') {
          _msg_ffzf = '空格';
        } else if (_ffzf_basic[k] == '\n') {
          _msg_ffzf = '换行符';
        } else if (_ffzf_basic[k] == '\r') {
          _msg_ffzf = '制表符';
        }
        _auto_showmsg(
          _input,
          _msg + '包含非法字符【' + _msg_ffzf + '】,请重新输入!',
          _this_config
        );
        return false;
      }
    }

    //自定义字符校验
    if (jQuery.type(_reg_ffzf) == 'string') {
      for (var i = 0; i < _input_value.length; i++) {
        var zf = _input_value.charAt(i);
        if (_reg_ffzf.indexOf(zf) >= 0) {
          _msg_ffzf = zf;
          if (zf == ' ') {
            _msg_ffzf = '空格';
          } else if (zf == '\n') {
            _msg_ffzf = '换行符';
          } else if (zf == '\r') {
            _msg_ffzf = '制表符';
          }
          _auto_showmsg(
            _input,
            _msg + '包含非法字符【' + _msg_ffzf + '】,请重新输入!',
            _this_config
          );
          return false;
        }
      }
    } else {
      for (var i = 0; i < _reg_ffzf.length; i++) {
        if (_input_value.indexOf(_reg_ffzf[i]) != -1) {
          _msg_ffzf = _reg_ffzf[i];
          if (_reg_ffzf[i] == ' ') {
            _msg_ffzf = '空格';
          } else if (_reg_ffzf[i] == '\n') {
            _msg_ffzf = '换行符';
          } else if (_reg_ffzf[i] == '\r') {
            _msg_ffzf = '制表符';
          }
          _auto_showmsg(
            _input,
            _msg + '包含非法字符【' + _msg_ffzf + '】,请重新输入!',
            _this_config
          );
          return false;
        }
      }
    }
    //非法单词校验
    for (var j = 0; j < _ffdc_normal.length; j++) {
      if (_input_value.toLowerCase().indexOf(_ffdc_normal[j]) != -1) {
        _auto_showmsg(
          _input,
          _msg + '包含非法单词【' + _ffdc_normal[j] + '】,请重新输入!',
          _this_config
        );
        return false;
      }
    }
  }
  return true;
}

//判断长度是否超限 中文和全角符号长度计为2
function _check_length(
  _input,
  _msg,
  _dataMaxlength,
  _dataMinxlength,
  _this_config
) {
  var _input_value = _input.val();
  if (_to_trim_all(_input_value) == '') {
    return true;
  }
  if (_dataMaxlength == -1 && _dataMinxlength == -1) {
    return true;
  }
  var _len = _byte_count(_input_value);
  if (_len > _dataMaxlength) {
    _auto_showmsg(
      _input,
      _msg + '长度不能超过' + _dataMaxlength + '位!',
      _this_config
    );
    return false;
  } else if (_len < _dataMinxlength) {
    _auto_showmsg(
      _input,
      _msg + '长度不能小于' + _dataMinxlength + '位!',
      _this_config
    );
    return false;
  }
  return true;
}

//获取长度
function _byte_count(_strvalue) {
  // _strvalue = _strvalue.replace(/([\u0391-\uFFE5])/ig, 'xs'); // 将文字改成双精度的（一个字为两个字符）
  var count = _strvalue.length;
  return count;
}

//==============================================================================//
//指定类型的校验																//
//==============================================================================//
var _validate_type_yb = /^[0-9]{6}$/; //邮编 (6位纯数字)
var _validate_type_sjh = /^1\d{10}$/; //手机号 （1开头，11位数字）
var _validate_type_email = /^[-\w]?\w+([-+.]\w+)*[-\w]?@[-\w]?\w+([-.]\w+)*[-\w]?\.[-\w]?\w+([-.]\w+)*[-\w]?$/; //邮箱
var _validate_type_gddh = /^((\(\d{3}\))|(\d{3}\-))?(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}$/; //固定电话
var _validate_type_lxdh = /^(((\d{3,4}-)|\d{3.4}-)?\d{7,8}),((\d{3,4}-)|\d{3.4}-)?\d{7,8}|((\d{3,4}-)|\d{3.4}-)?\d{7,8}$/; //联系电话(11位半角数字)
var _validate_type_url = /^http:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/; //网址
var _validate_type_English = /^[A-Za-z]+$/; //英文
var _validate_type_Chinese = /^[Α-￥]+$/; //中文
var _validate_type_QQ = /^[1-9]\d{4,}$/; //QQ
var _validate_type_number = /^\d+$/; //自然数
var _validate_type_num = /^[0-9]\d*$/; //正整数(包含0)
var _validate_type_integer = /^[-\+]?\d+$/; //整数
var _validate_type_double = /^[-\+]?\d+(\.\d+)?$/; //小数
var _validate_type_posdouble = /^\d+(\.\d+)?$/; //正小数
var _validate_type_zzjgdm = /^[a-zA-Z0-9]{8}-[a-zA-Z0-9]|[a-zA-Z0-9]{18}$/; //组织机构代码(包含-)
var _validate_type_zzjgm = /^[a-zA-Z0-9]{9}$/; //组织机构代码(包含-)
var _validate_type_fzwh = /^[\u4e00-\u9fa5\d]*[\【\（\(\〔\[]\d{4}[\]\】\）\〕\)\]][\u4e00-\u9fa5\d]+$/; //发文字号
var _validate_type_ip = /(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)/; //ip地址
var _validate_type_szjzf = /[^\x00-\xff]/; //双字节字符
var _validate_type_editor = /.+/; //文本编辑器的校验
var _validate_type_default = /.+/; //默认的
var _validate_type_password = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,48}$/; //密码的校验(必须为子母和汉字的组合)
var _validate_type_normal = /[\[\]:?\"{}`=^&!*|;$%@'<>()+\r\n,\\../ ]/; // 非法字符校验
var _validate_type_cz = /(^(\d{3,4}-)?\d{7,8})$|^((1\d{10}$))/; //传真
var _validate_type_sbdjzh = /^(^([A-Za-z0-9]{12})$)|(^([A-Za-z0-9]{18})$)$/; // 社保登记号校验
var _validate_type_phone = /^((1\d{10})|(((\(\d{3,4}\))|(\d{3,4}\-))?[1-9]\d{6,7}(\(\d{1,3}\)|-\d{1,3})?))$/; // 手机号或区号+座机号+分机
var _validate_type_znumber = /^[1-9]\d*$/; //正整数(包含0)
//根据校验类型,进行校验
function _auto_validate_by_type(
  _input,
  _msg,
  _data_max_length,
  _data_min_length,
  _type,
  _this_config
) {
  var _input_value = _input.val();
  //如果值为空,则不进行校验
  if (_to_trim_all(_input_value) == '') {
    return true;
  }
  var _validate_type = _type.toLowerCase();
  var _is_right = false;
  if (_validate_type == 'sfzhm') {
    _is_right = _sfzhm_is_right(_input, _msg, _this_config);
    if (_is_right == false) {
      return false;
    }
  } else if (_validate_type == 'money') {
    _is_right = _money_is_right(_input);
    if (_is_right == false) {
      _auto_showmsg(_input, _msg + '必须是有效数字!', _this_config);
    }
  } else {
    var _reg_validate = _get_validate_type(_validate_type);
    if (_reg_validate == 'thistypeisnotfind') {
      if (customMethod[_type] == undefined) {
        alert('601:[' + _type + ']是未知的校验类型,请检查设置!');
        return false;
      } else {
        var inputC = new inputConfig();
        inputC.owner = _input;
        inputC.name = _input.attr('name');
        inputC.value = _input.val();
        inputC.msgName = _msg;
        return customMethod[_type](inputC);
      }
    }
    if (
      jQuery.type(_reg_validate) == 'string' ||
      jQuery.type(_reg_validate) == 'array'
    ) {
      _is_right = _auto_validate_ffzf(
        _input,
        _msg,
        _validate_type,
        _this_config
      );
    } else {
      _is_right = _is_right_by_reg(_input, _msg, _reg_validate, _this_config);
    }
  }
  return _is_right;
}

function inputConfig() {
  this.owner; //文本框对象
  this.name = ''; //文本框的那么属性
  this.value = ''; //文本框的值
  this.msgName = ''; //文本框的中文名称
}

function _get_validate_type(_validate_type) {
  switch (_validate_type.toLowerCase()) {
    case 'yb':
      return _validate_type_yb;
    case 'sjh':
      return _validate_type_sjh;
    case 'lxdh':
      return _validate_type_lxdh;
    case 'email':
      return _validate_type_email;
    case 'gddh':
      return _validate_type_gddh;
    case 'url':
      return _validate_type_url;
    case 'english':
      return _validate_type_English;
    case 'chinese':
      return _validate_type_Chinese;
    case 'qq':
      return _validate_type_QQ;
    case 'number':
      return _validate_type_number;
    case 'num':
      return _validate_type_num;
    case 'zzjgdm':
      return _validate_type_zzjgdm;
    case 'zzjgm':
      return _validate_type_zzjgm;
    case 'fzwh':
      return _validate_type_fzwh;
    case 'ip':
      return _validate_type_ip;
    case 'szjzf':
      return _validate_type_szjzf;
    case 'integer':
      return _validate_type_integer;
    case 'double':
      return _validate_type_double;
    case 'posdouble':
      return _validate_type_posdouble;
    case 'full':
      return _ffzf_full;
    case 'normal':
      return _ffzf_normal;
    case 'wnormal':
      return _ffdc_normal;
    case 'less':
      return _ffzf_less;
    case 'basic':
      return _ffzf_basic;
    case 'editor':
      return _validate_type_editor;
    case 'default':
      return _validate_type_default;
    case 'password':
      return _validate_type_password;
    case 'normal':
      return _validate_type_normal;
    case 'cz':
      return _validate_type_cz;
    case 'sbdjzh':
      return _validate_type_sbdjzh;
    case 'phone':
      return _validate_type_phone;
    case 'znumber':
      return _validate_type_znumber;
    default:
      return 'thistypeisnotfind';
  }
}

//是否符合正则规则
function _is_right_by_reg(_input, _msg, _validate_reg, _this_config) {
  var _input_value = _input.val();
  if (_input_value != '') {
    if (_validate_reg.exec(_input_value) == null) {
      var _reg_msg = _input.attr(_init_validate_reg_msg_name);
      var _showmsg = _msg + '格式不正确!';
      if (_to_trim_all(_reg_msg) != '' && _reg_msg + '' != 'undefined') {
        _showmsg = _reg_msg;
      }
      _auto_showmsg(_input, _showmsg, _this_config);
      return false;
    }
  }
  return true;
}
//是否是身份证号码
function _sfzhm_is_right(_input, _msg, _this_config) {
  if (_to_trim_all(_input.val()) != '') {
    if (_check_sfzhm(_input, _msg, _this_config) == false) {
      return false;
    }
  }
  return true;
}

function _check_sfzhm(_input, _msg, _this_config) {
  _input.val(_input.val().toUpperCase());
  var _input_value_temp = _input.val() + '';
  var _input_value = new String(_input_value_temp);
  var _l_l_jym = new Array(
    7,
    9,
    10,
    5,
    8,
    4,
    2,
    1,
    6,
    3,
    7,
    9,
    10,
    5,
    8,
    4,
    2,
    1
  );
  var _l_l_total = 0;
  //位数校验
  if (_input_value.length != 15 && _input_value.length != 18) {
    _auto_showmsg(_input, _msg + '必须为15位或18位!', _this_config);
    return false;
  }
  //15校验
  if (_input_value.length == 15) {
    if (_is_number(_input_value) == false) {
      _auto_showmsg(_input, _msg + '输入错误，应全为数字!', _this_config);
      return false;
    }
    //15位转18位
    _input_value = _convert_the_sfzhm(_input_value);
  }
  var _l_s_temp = _input_value.substr(0, 17);
  if (_is_number(_l_s_temp) == false) {
    _auto_showmsg(_input, _msg + '前17位输入错误，应全为数字!', _this_config);
    return false;
  }
  var _last_char = _input_value.substring(17, 18);
  if (
    _is_number(_last_char) == false &&
    _last_char != 'x' &&
    _last_char != 'X'
  ) {
    _auto_showmsg(_input, _msg + '最后一位输入错误!', _this_config);
    return false;
  }
  var _l_s_temp_temp = _input_value.substr(6, 8);
  var _l_s_temp = new String(_l_s_temp_temp);
  var _year = _l_s_temp.substring(0, 4);
  var _month = _l_s_temp.substring(4, 6);
  var _day = _l_s_temp.substring(6, 8);
  var _l_l_temp_temp;
  var _l_s_csny = _year + '-' + _month + '-' + _day;
  //是否是合法日期
  if (_is_date(_l_s_csny) == false) {
    _auto_showmsg(_input, _msg + '的出生年月日不正确!', _this_config);
    return false;
  }
  for (var i = 0; i < _input_value.length - 1; i++) {
    _l_l_temp_temp = parseInt(_input_value.substr(i, 1), 10) * _l_l_jym[i];
    _l_l_total += _l_l_temp_temp;
  }
  if (_is_number(_input_value.substring(17, 18))) {
    _l_l_total += parseInt(_input_value.substring(17, 18), 10);
  }
  if (
    _input_value.substring(17, 18) == 'X' ||
    _input_value.substring(17, 18) == 'x'
  ) {
    _l_l_total += 10;
  }
  _l_l_total--;
  if (_l_l_total % 11 != 0) {
    _auto_showmsg(_input, _msg + '输入不正确!', _this_config);
    return false;
  }
  _input.val(_input_value);
  return true;
}

//15位身份证号转成18位
function _convert_the_sfzhm(_sfzhm) {
  var _l_l_jym = new Array(
    7,
    9,
    10,
    5,
    8,
    4,
    2,
    1,
    6,
    3,
    7,
    9,
    10,
    5,
    8,
    4,
    2,
    1
  );
  var _l_l_total = 0;
  var _last_char;
  var _input_value = new String(_sfzhm);
  if (_input_value.length == 15) {
    var _input_value_temp =
      _input_value.substring(0, 6) + '19' + _input_value.substring(6, 15);
    for (var i = 0; i < _input_value_temp.length; i++) {
      var _l_l_temp_temp =
        parseInt(_input_value_temp.substr(i, 1), 10) * _l_l_jym[i];
      _l_l_total += _l_l_temp_temp;
    }
    _l_l_total--;
    var _last_number = _l_l_total % 11; //最后一位
    if (_last_number == 0) {
      _last_char = 0;
    } else {
      if (_last_number == 1) {
        _last_char = 'X';
      } else {
        _last_char = 11 - _last_number;
      }
    }
    _input_value_temp = _input_value_temp + _last_char;
    return _input_value_temp;
  } else {
    return _input_value;
  }
}
//==============================================================================//
//判断是否需要加载其他事件,如果需要,则加载,否则 跳过							//
//==============================================================================//

function _money_is_right(_input, _msg, _this_config) {
  if (_to_trim_all(_input.val()) != '') {
    if (_check_money(_input, _msg, _this_config) == false) {
      return false;
    }
  }
  return true;
}

function _check_money(_input, _msg, _this_config) {
  if (_input.attr(_init_money_jqws_name) + '' == 'undefined') {
    return _is_money(_input.val());
  }
  var _jqws = _input.attr(_init_money_jqws_name);
  var _jqws_temp = _jqws.split(',');
  jqws = _jqws_temp[0];
  var _init_money_msg = _jqws_temp[1];
  if (_is_number(jqws) == false) {
    _jqws = 2;
  }
  return _change_the_money(_input, parseInt(_jqws, 10), _init_money_msg);
}
//金额自动转换(保留几位有效数字)												//
//			1.第一个参数是文本框本身(jquery对象)								//
//			2.第二个参数是精确多少位,(不是有效数字,默认是2)						//
var _default_money = '';

function _change_the_money(_input, _jqws, _init_money_msg) {
  var _input_value = _to_trim_all(_input.val());
  if (_input.attr(_init_right_move) + '' == 'undefined') {
    if (_input_value == '' || _default_money == _input_value) {
      _input.val(_input_value);
      return;
    }
  }
  var _index = _input_value.indexOf('.');

  if (
    isNaN(_input_value) ||
    _index == 0 ||
    _input_value.toUpperCase().indexOf('E') != -1
  ) {
    return false;
  } else {
    var i = -1;
    if (_index != -1) {
      i = _input_value.length - (_index + 1);
    }
    if (_jqws < i) {
      var _value_temp =
        _input_value.substring(0, _index + _jqws + 2) * Math.pow(10, _jqws);
      _value_temp = Math.round(_value_temp);
      _value_temp = _value_temp / Math.pow(10, _jqws);
      _input.val(_value_temp);
      _change_the_money(_input, _jqws, _init_money_msg);
    } else {
      if (i == -1 && _jqws == 0) {
        return;
      }
      for (; i < _jqws; i = i + 1) {
        if (i == -1) {
          _input_value = _input_value + '.0';
          i = 0;
        } else {
          _input_value = _input_value + '0';
        }
      }
      _input.val(_input_value);
      _default_money = _input_value;
    }
  }
  return true;
}

//==============================================================================//
//小工具,(去空格,判断是否为正整数(包含0))										//
//==============================================================================//
function _to_trim_all(strValue) {
  return (strValue + '').replace(/\s+/g, '');
}
//判断是不是正整数
function _is_number(strValue) {
  if (_to_trim_all(strValue) == '') {
    return false;
  }
  if (!/^[0-9]*$/.test(strValue)) {
    return false;
  }
  return true;
}

function _is_money(strValue) {
  var _input_value = _to_trim_all(strValue);
  var _index = _input_value.indexOf('.');
  if (
    isNaN(_input_value) ||
    _index == 0 ||
    _index == _input_value.length - 1 ||
    _input_value.toUpperCase().indexOf('E') != -1
  ) {
    return false;
  }
  return true;
}

//获取用户定义的文字提示信息
function _get_valiflag_msg(_input) {
  var _validate_flag = $(this).attr(_init_validate_flag_name);
  var _validate_properties = (_validate_flag + '').split(',');
  var _msg = _validate_properties[2];
  if (_msg + '' == 'undefined' || _to_trim_all(_msg) == '') {
    return '';
  }
  return _msg;
}
//判断字符串是否符合日期格式，如1999-03-07
function _is_date(theStr) {
  var strObj = new String(theStr);

  var strObjTemp;
  //1.theStr.length<>10
  if (strObj.length != 10 && strObj.length != 7) {
    return false;
  }
  //2.判断第五位、第八位是"-"
  if (strObj.substring(4, 5) != '-') {
    return false;
  }
  if (strObj.length == 10) {
    if (strObj.substring(7, 8) != '-') {
      return false;
    }
  }
  //3.校验年部分是数字，并在1900~2100之间，月部分是数字，并在1~12之间，日部分是数字，并在1~31之间
  strObjTemp = new String(strObj.substring(0, 4));

  if (
    _is_number(strObjTemp) == false ||
    parseInt(strObjTemp, 10) <= 1900 ||
    parseInt(strObjTemp, 10) > 2100
  )
    return false;
  strObjTemp = new String(strObj.substring(5, 7));

  if (
    _is_number(strObjTemp) == false ||
    parseInt(strObjTemp, 10) < 1 ||
    parseInt(strObjTemp, 10) > 12
  )
    return false;

  if (strObj.length == 10) {
    strObjTemp = new String(strObj.substring(8, 10));
    if (
      _is_number(strObjTemp) == false ||
      parseInt(strObjTemp, 10) < 1 ||
      parseInt(strObjTemp, 10) > 31
    )
      return false;
  }

  if (strObj.length == 10) {
    if (_is_right_date(theStr) == false) {
      return false;
    }
  }
  return true;
}
//判断是不是合法日期
function _is_right_date(theStr) {
  var strObj = new String(theStr);
  var theYear = parseInt(strObj.substring(0, 4), 10);
  var theMonth = parseInt(strObj.substring(5, 7), 10);
  var theDay = parseInt(strObj.substring(8, 10), 10);
  switch (theMonth) {
    case 4:
    case 6:
    case 9:
    case 11:
      if (theDay == 31) return false;
      else break;
    case 2:
      if ((theYear % 4 == 0 && theYear % 100 != 0) || theYear % 400 == 0) {
        //润年2月份29天
        if (theDay > 29) return false;
      } else {
        if (theDay > 28) return false;
      }
      break;
    default:
      break;
  }
  return true;
}

//==============================================================================//
//================================【基础方法,不懂勿动】=========================//
//==============================================================================//

//信息提示方法
function _auto_showmsg(_input, _msg, _msg_config) {
  var _is_disabled = false;
  //判断是否禁用了该文本框
  if (_to_trim_all(_input.attr('disabled')) == 'disabled') {
    _is_disabled = true;
  }
  if (_msg_config[0] == '2') {
    _auto_msg_rightline(_input, _msg, _msg_config[1]);
  } else {
    alert(_msg);
    if (_is_disabled == true) {
      _input.attr('disabled', false);
      _input.focus();
      _input.attr('disabled', true);
    } else {
      _input.focus();
    }
  }
}

//设置右侧提示信息
function _auto_msg_rightline(_input, _msg, _color) {
  if (!_input.next('span').hasClass(_init_validate_msg_value)) {
    _input.after(
      "<span name='" +
      _init_validate_msg_value +
      "' class='" +
      _init_validate_msg_value +
      "'>" +
      _msg +
      '</span>'
    );
  }
}
//清空右侧提示信息
function _auto_msg_rightline_clear(_validate_form) {
  $("[name='" + _init_validate_msg_value + "']").remove();
}

function _auto_msg_rightline_clear_by_input(_input) {
  _input.next("[name='" + _init_validate_msg_value + "']").remove();
}

$("[type='reset']").click(function() {
  _auto_msg_rightline_clear($(this).parentsUntil('form'));
  $('.Select ul li')
    .eq(0)
    .click();
});
//===============================================
//加载配置
function loadConfig(jsonStr) {
  var json = eval('(' + jsonStr + ')');
  //设置form表单属性
  var formName = 'form2';

  if (json.formName != undefined) {
    formName = json.formName;
  }
  var formObj = $("form[name='" + formName + "']");
  if (formObj.length <= 0) {
    alert(
      '初始化加载失败，无法找到name=' +
      formName +
      '的form表单，请检查后台模板设置！'
    );
    return;
  }
  //msgType
  var msgType = '1';
  if (json.msgType != undefined) {
    var msgcolor = json.msgColor;
    if (json.msgColor == undefined) {
      msgcolor = 'red';
    }
    msgType = json.msgType + ',' + _to_trim_all(msgcolor);
  }
  formObj.attr('msgtype', msgType);

  //validateType
  if (json.validateType != undefined) {
    formObj.attr('validate', json.validateType);
  }

  var inputs = json.inputConfigs;
  //alert(inputs.length);
  for (var i = 0; i < inputs.length; i++) {
    var name = inputs[i].name;
    var inputObj = $("[name='" + name + "']");
    if (inputObj.length <= 0) {
      alert(
        '初始化加载失败，无法找到name=' + name + '的input，请检查后台模板设置！'
      );
      return;
    }
    //设置valiflag
    var valiflag = '';
    valiflag = inputs[i].maxLength + ',';
    if (inputs[i].valiflagKey != undefined) {
      valiflag = valiflag + inputs[i].valiflagKey;
    }
    valiflag = valiflag + ',';
    if (inputs[i].msgName != undefined) {
      valiflag = valiflag + inputs[i].msgName;
    }
    valiflag = valiflag + ',';
    if (inputs[i].isCanEmpty != undefined) {
      valiflag = valiflag + inputs[i].isCanEmpty;
    }
    inputObj.attr('valiflag', valiflag);

    //设置relation
    if (inputs[i].relation != undefined) {
      inputObj.attr('relation', inputs[i].relation);
    }

    //设置regMsg
    if (inputs[i].regMsg != undefined) {
      inputObj.attr('regmsg', inputs[i].regMsg);
    }

    //设置relmsg
    if (inputs[i].relMsg != undefined) {
      inputObj.attr('relmsg', inputs[i].relMsg);
    }
  }
}

//扩展jquery对象
(function($) {
  $.fn.extend({
    //快速设置某对象的valiflag属性
    valiflag: function(setting) {
      if (setting == undefined) {
        return jQuery(this).attr('valiflag');
      }
      jQuery(this).attr('valiflag', setting);
    },
    //对单个文本框进行校验
    validate: function() {
      var formObj = jQuery(this).parentsUntil('form');
      return _on_blur_validate(
        formObj.attr('name'),
        jQuery(this),
        'normal',
        formObj.index(jQuery(this))
      );
    }
  });
})(jQuery);

//扩展js内置String对象
String.prototype.trim = function() {
  return (this + '').replace(/(^\s*)|(\s*$)/g, '');
};
String.prototype.trimAll = function() {
  return (this + '').replace(/\s+/g, '');
};
