/**
* @file 图搜模块，会被异步加载
* @author wukaifang(wukaifang@baidu.com)
**/

/* global s_session swfobject*/
/* eslint-disable fecs-camelcase*/
(function () {
    // 框升级2.0 图搜升级样式
    var samNewBox = bds && bds.comm && bds.comm.samNewBox;
    var os = navigator.platform.toUpperCase();
    var uploadServer = '//graph.baidu.com/upload';
    var isMac = os.indexOf('MAC') !== -1;
    var $input = $('#kw');
    var $namespace = $('#form').parent();
    // 命中小流量使用抽样样式
    var linkUrl = samNewBox ? 'https://pss.bdstatic.com/r/www/cache/static/protocol/https/soutu/css/soutu_new_sam_a6c95ec.css' : 'https://pss.bdstatic.com/r/www/cache/static/protocol/https/soutu/css/soutu_new2_e1a824c.css';

    var MAXSIZE = 1024 * 1024 * 10; // 10M

    var compressOpt = {
        // 压缩后图片的长边
        maxLen: 800,

        // width * height 限制
        resolution: 1000000,

        // 压缩图片的质量
        quality: 0.75,

        // 是否压缩成正方形
        isSquare: false,

        // 压缩后的图片数据类型，0:二进制, 1:base64
        compressType: 0
    };

    var ERROR_MSG = {
        1: '抱歉，您上传的文件不是图片格式',
        2: '图片上传失败',
        3: '抱歉，您上传的文件太大'
    };
    var timer = null;

    var lib = {
        getEnv: function () {
            if (bds && bds.comm) {
                if (bds.comm.ishome && bds.comm.newindex) {
                    return 'newindex';
                }
                else if (bds.comm.ishome) {
                    return 'index';
                }
                else if (/^\/imgsearch/.test(location.pathname)) {
                    return 'imgresult';
                }
            }
            return 'result';
        },
        // 判断是否支持语音，不支持语音，mac下不出语音icon
        supportVoice: function () {
            window.URL = window.URL || window.webkitURL;
            navigator.getUserMedia = navigator.getUserMedia
                || navigator.webkitGetUserMedia
                || navigator.mozGetUserMedia
                || navigator.msGetUserMedia;
            window.AudioContext = window.AudioContext || window.webkitAudioContext;

            // 基本上，只支持新版的chrome和ff
            if (!navigator.getUserMedia || !window.URL) {
                return false;
            }
            if (!window.AudioContext) {
                return false;
            }
            if (!window.Worker) {
                return false;
            }
            if (!swfobject.hasFlashPlayerVersion('11.1.0')) {
                return false;
            }
            return true;
        },
        parseQuery: function () {
            var queryStr = window.location.search.substr(1);
            var obj = {};
            var params = queryStr.substring(queryStr.indexOf('?') + 1, queryStr.length).split('&');
            for (var i = 0; i < params.length; i++) {
                var param = params[i];
                var kv = param.split('=');
                if (kv[0]) {
                    obj[kv[0]] = decodeURIComponent(kv[1]);
                }
            }

            return obj;
        },
        getQuery: function (name) {
            var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
            var r = window.location.search.substr(1).match(reg);
            if (r != null) {
                return (r[2]);
            }
            return null;
        },
        isURL: function (val) {
            return (/^(((http[s]?:\/\/)|(ftp:\/\/))?([\w-]+\.)+(com|edu|gov|int|mil|net|org|biz|info|pro|name|museum|coop|aero|xxx|idv|al|dz|af|ar|ae|aw|om|az|eg|et|ie|ee|ad|ao|ai|ag|at|au|mo|bb|pg|bs|pk|py|ps|bh|pa|br|by|bm|bg|mp|bj|be|is|pr|ba|pl|bo|bz|bw|bt|bf|bi|bv|kp|gq|dk|de|tl|tp|tg|dm|do|ru|ec|er|fr|fo|pf|gf|tf|va|ph|fj|fi|cv|fk|gm|cg|cd|co|cr|gg|gd|gl|ge|cu|gp|gu|gy|kz|ht|kr|nl|an|hm|hn|ki|dj|kg|gn|gw|ca|gh|ga|kh|cz|zw|cm|qa|ky|km|ci|kw|cc|hr|ke|ck|lv|ls|la|lb|lt|lr|ly|li|re|lu|rw|ro|mg|im|mv|mt|mw|my|ml|mk|mh|mq|yt|mu|mr|us|um|as|vi|mn|ms|bd|pe|fm|mm|md|ma|mc|mz|mx|nr|np|ni|ne|ng|nu|no|nf|na|za|zq|aq|gs|eu|pw|pn|pt|jp|se|ch|sv|ws|yu|sl|sn|cy|sc|sa|cx|st|sh|kn|lc|sm|pm|vc|lk|sk|si|sj|sz|sd|sr|sb|so|tj|tw|th|tz|to|tc|tt|tn|tv|tr|tm|tk|wf|vu|gt|ve|bn|ug|ua|uy|uz|es|eh|gr|hk|sg|nc|nz|hu|sy|jm|am|ac|ye|iq|ir|il|it|in|id|uk|vg|io|jo|vn|zm|je|td|gi|cl|cf|cn)(:\d+)?(\/[^\s]*)?)$/).test(val);
        },
        blobtoBase64: function (blob, callback) {
            // 使用 FileReader
            var fr = new FileReader();
            fr.onload = function () {
                callback(this.result);
            };
            fr.onerror = function (err) {
                callback();
            };
            fr.readAsDataURL(blob);
        },
        sendLog: function (obj) {
            var urlMatches = location.href.match(/sign=(\w{32})\b/);
            var sign = urlMatches && urlMatches[1] || '';
            obj.sign = sign;
            obj.fm = 'inlo';
            if (obj.rsv_imageclick) {
                obj.rsv_imageclick = lib.getEnv() + '_' + obj.rsv_imageclick;
            }
            if (window.soutu_mixsearch) {
                obj.rsv_imagemix = 1;
            }
            window.ns_c(obj);
        },
        loadScript: function (src) {
            var script = document.createElement('script');
            script.async = true;
            script.setAttribute('charset', 'UTF-8');
            script.src = src;
            document.getElementsByTagName('head')[0].appendChild(script);
        }
    };
    var template = {
        graphIconHtml: function () {
            return samNewBox ? '<span class="sam_search_soutu c-icon" style="'
            + 'position: absolute;right: 14px;top: 50%;margin-top: -12px;'
            + 'font-size: 24px;height: 24px;line-height: 24px;width: 24px;color: #4E6EF2;'
            + 'z-index: 5;'
            + '">&#xe68d;</span>' : '<span class="soutu-btn"></span>';
        },
        hoverTipHtml: function () {
            // 框升级2.0 tips样式升级
            return samNewBox ? '<span class="sam_search_soutu_hover" style="display: none;">图片搜索</span>' : '<span class="soutu-hover-tip" style="display: none;">按图片搜索</span>';
        },
        wrapHtml: function () {
            var uploadHtml = '<span class="upload-text upload-text-new">选择文件</span>';
            // 框升级2.0 搜图按钮样式升级
            var urlBtnHtml = samNewBox ? '<span class="soutu-url-btn soutu-url-btn-new sam_url_btn_new"><span class="sam_btn_text">百度一下</span><i class="btn_wrap_radius"></i></span>' : '<span class="soutu-url-btn soutu-url-btn-new">百度一下</span>';
            var closeHtml = '<a class="soutu-close c-icon soutu-close-new" href="javascript:void(0);">&#xe610;</a>';
            var samUrlWrapClass = samNewBox ? 'sam_url_wrap ' : '';
            var samUrlKwClass = samNewBox ? 'sam_url_kw ' : '';
            var soutuHtml =  ''
                + '<div class="soutu-layer new-pmd">'
                +     '<div class="soutu-url">'
                +         '<span class="' + samUrlWrapClass + 'soutu-url-wrap">'
                +             '<input id="soutu-url-kw" class="' + samUrlKwClass + 'soutu-url-kw" maxlength="255" '
                +                 'autocomplete="off" placeholder="在此处粘贴图片网址"/>'
                +         '</span>'
                +         '<span class="soutu-url-btn soutu-url-btn-old">'
                +             '<i class="soutu-icon soutu-url-btn-icon"></i>'
                +         '</span>'
                +          urlBtnHtml
                +         '<span class="soutu-url-error">请输入正确的图片网址</span>'
                +     '</div>'
                +     '<div class="soutu-state-normal">'
                +           '<div class="soutu-drop">'
                +               '<span class="soutu-drop-tip">拖拽图片到这里</span>'
                +               '<i class="soutu-icon soutu-drop-icon"></i>'
                +           '</div>'
                +           '<div class="upload-wrap">'
                +               '<input type="file" class="upload-pic" value="上传图片"/>'
                +               '<i class="soutu-icon upload-icon"></i>'
                +               '<span class="upload-text upload-text-old">本地上传图片</span>'
                +               uploadHtml
                +           '</div>'
                +     '</div>'
                +      '<a class="soutu-icon soutu-close soutu-close-old" href="javascript:void(0);"></a>'
                +     closeHtml
                + '</div>';
            return soutuHtml;
        },

        waitingHtml: function () {
            return [
                '<div class="soutu-state-waiting soutu-waiting">',
                '<p>正在加载图片...</p>',
                '</div>'
            ].join('');
        },
        errorHtml: function (msg, status) {
            var hastip = status === 1 || status === 3;
            var errorTips = hastip ? '<p class="soutu-error-tip">仅支持10M以下jpg，jpeg，png，bmp，gif格式图片</p>' : '';
            var cl = hastip ? ' soutu-error-hastip' : '';
            return ''
            + '<div class="soutu-state-error soutu-error' + cl + '">'
            +     '<p class="soutu-error-main">'
            +         '<i class="c-icon c-gap-right-small soutu-error-icon">&#xe622;</i>' + msg
            +         '，请<a href="javascript:void(0)" class="soutu-error-upload">重新上传</a>'
            +     '</p>'
            +     errorTips
            + '</div>';
        },
        newTabTipHtml: function (data) {
            return [
                '<div class="soutu-state-newtabtip soutu-newtab">',
                    '<div class="soutu-newtab-cont">',
                        '<div class="soutu-newtab-img" style="background-image:url(' + data.imgUrl + ')">',
                        '</div>',
                        '<div class="soutu-newtab-text">',
                            '<p>' + data.text + '</p>',
                            '<span></span>',
                        '</div>',
                    '</div>',
                    '<a class="soutu-newtab-link" href="' + data.url + '" target="_blank">查看搜索结果</a>',
                '</div>'
            ].join('');
        }
    };

    var mixsearch = {
        init: function () {
            // 非图搜结果页
            if (lib.getEnv() !== 'imgresult') {
                return;
            }
            bds && bds.util && bds.util.sendCVLog && bds.util.sendCVLog('87_15', 2);
            var $searchForm = $('#form');
            var $thumb = $searchForm.find('.soutu-input-image');

            // 搜索框缩略图不存在，就不是图搜结果页
            if (!$thumb.length) {
                return;
            }
            // 此时搜索框有缩略图，支持图和文字混合搜索
            var isMixsearch = true;

            // 修改/s的sug逻辑，在用户删除缩略图后，又让恢复/s的设置
            var query = lib.parseQuery();
            var hiddens = $searchForm.find('input[type=hidden]');
            var originHiddens = hiddens.clone();
            $searchForm.attr('action', '/imgsearch');
            hiddens.remove();
            delete query.wd;
            $searchForm.append('<input type="hidden" name="sign" value="' + query.sign + '">');

            // 移除缩略图需要做的逻辑
            var removeThumb = function () {
                $thumb.remove();
                $thumb.off('click.soutu');
                $thumb.removeClass('soutu-input-image-active');
                $input.off('.soutu');
                $input.attr('placeholder', '').removeClass('soutu-input');
                isMixsearch = false;
                $searchForm.find('input[type=hidden]').remove();
                $searchForm.append(originHiddens);
                $searchForm.attr('action', '/s');
            };

            // 绑定缩略图点击事件
            $thumb.on('click.soutu', function () {
                removeThumb();

                lib.sendLog({
                    rsv_imageclick: 'del_thumb_by_click'
                });
            });

            // 点击输入框，隐藏语音图像按钮
            $input.on('keydown', function (e) {
                var keyword = $input.val();
                // 点删除按钮并且搜索词清空，搜索词为空
                if (e.which === 8 && !keyword.length) {
                    // 如果已经是激活删除状态，用户在搜索词为空时第二次点击删除健
                    if ($thumb.hasClass('soutu-input-image-active')) {
                        removeThumb();
                        lib.sendLog({
                            rsv_imageclick: 'del_thumb_by_return'
                        });
                    }
                    // 用户在搜索词为空时第一次点击删除健
                    else {
                        $thumb.addClass('soutu-input-image-active');
                    }
                    return;
                }
                // 不为空，但缩略图处于删除激活状态
                if (keyword.length <= 1 && $thumb.hasClass('soutu-input-image-active')) {
                    $thumb.removeClass('soutu-input-image-active');
                }
            });

            // 输入框获得焦点
            $input.on('focus.soutu', function (e) {
                $thumb.show();
            });

            // 输入框点击
            $input.on('click', function (e) {
                if (isMixsearch) {
                    lib.sendLog({
                        rsv_imageclick: 'click_input_thumb'
                    });
                }
                else {
                    lib.sendLog({
                        rsv_imageclick: 'click_input'
                    });
                }
            });

            // 输入框失去焦点
            $input.on('blur.soutu', function (e) {
                $thumb.removeClass('soutu-input-image-active');
            });

            // 移除缩略图后，该事件还在，目的是是统计文本搜索点击
            // 点击百度一下按钮，刷新页面
            $('#su').on('click.soutu', function () {
                var val = $input.val();
                // 有缩略图并且输入框为空
                if (isMixsearch && !val.length) {
                    lib.sendLog({
                        rsv_imageclick: 'search_only_thumb'
                    });
                    location.href = '/imgsearch?' + $.param({
                        sign: query.sign,
                        wd: query.sign.substr(5, 16)
                    });
                    return false;
                }
            });

            $searchForm.on('submit', function () {
                // 删除缩略图后的纯文本搜索
                if (!isMixsearch) {
                    lib.sendLog({
                        rsv_imageclick: 'search_only_text'
                    });
                }
                else {
                    lib.sendLog({
                        rsv_imageclick: 'search_image_and_text'
                    });
                }
            });
        }
    };

    var soutu = {
        init: function () {
            var me = this;

            // 功能检测
            me.canDrop = 'ondrop' in document.body;

            // 插入样式
            var link = $('<link rel="stylesheet" href="'
                + linkUrl
                + '" type="text/css" data-for="result"/>'
            );
            if (lib.getEnv() === 'newindex') {
                link.insertBefore($namespace.parent()); // 新首页放入到body里，在head里会被新首页干掉
            }
            else {
                link.appendTo('head');
            }

            // 插入图像icon
            me.$graphIcon = $(template.graphIconHtml()).prependTo($input.parent());
            $('#form').addClass('has-soutu');
            me.$hoverTip = $(template.hoverTipHtml()).appendTo($input.parent());
            // soutu Dom 加载完成
            $('#form').addClass('has-soutu');
            // 针对不同环境，增加不同状态类
            $namespace
                .addClass((isMac) ? 'soutu-env-mac' : 'soutu-env-nomac')
                .addClass('soutu-env-' + lib.getEnv());
            if (samNewBox) {
                $('.sam_search_soutu').length && $('.sam_search_soutu').css('display', 'block');
            }
            // 初始状态
            me.state = 'init';

            mixsearch.init();
            // 绑定事件
            me.listenIcon();
        },
        listenIcon: function () {
            var invokePos = lib.getEnv() === 'newindex' ? 5 : 16;
            var me = this;
            me.$graphIcon
                .on('click', function (e) {
                    // 当出现 toast 时，点击搜图需隐藏 toast
                    $('.search-keyboard-toast').hide();
                    e.stopPropagation();
                    e.preventDefault();
                    if (bds && bds.util && bds.util.increaseService && bds.util.increaseService.canInvoke(invokePos)) {
                        bds.util.increaseService.execInvoke(invokePos);
                    } else {
                        me.show();

                        me.log({
                            rsv_imageclick: 'camerabtn'
                        });

                        me.antispam();
                    }

                });
            me.$graphIcon.hover(function () {
                if (bds && bds.util && bds.util.increaseService && bds.util.increaseService.isIPad() && bds.util.increaseService.canInvoke(invokePos)) {
                    return;
                }
                clearTimeout(timer);
                me.$hoverTip.show();
            }, function () {
                timer = setTimeout(function () {
                    me.$hoverTip.hide();
                }, 200);
            });

            // 该事件只会在浏览器中拖动触发，浏览器外拖动的文件是不会触发该事件的。
            $(document).on('dragstart.soutu', function (e) {
                var transfer = e.originalEvent.dataTransfer;
                var target = e.target || e.srcElement;
                var nodeName = target.nodeName.toLowerCase();
                var url;

                if (nodeName === 'img') {
                    url = target.src;
                    try {
                        transfer.setData('text/plain', url);
                    }
                    catch (err) {
                        transfer.setData('Text', url);
                    }
                }
                // 特殊情况，a链接下的图片
                // TODO 该策略或许存在问题
                else if (nodeName === 'a') {
                    var img = $(target).children('img');
                    if (img.length) {
                        url = img[0].src;
                        try {
                            transfer.setData('text/plain', url);
                        }
                        catch (err) {
                            transfer.setData('Text', url);
                        }
                    }
                }
            });

            // 搜索框接受拖动
            $input.on('drop.soutu', function (e) {
                // 如果是从浏览器外拖动的文件
                if (e.originalEvent.dataTransfer
                    && e.originalEvent.dataTransfer.files
                    && e.originalEvent.dataTransfer.files.length
                ) {
                    e.stopPropagation();
                    e.preventDefault();

                    me.$graphIcon.trigger('click');
                    me.handleDrop(e);

                    me.log({
                        rsv_imageclick: 'iptdrop'
                    });
                }
            // fvck ie!!!
            }).on('dragover.soutu', function (e) {
                var cookieset = window.bds && bds.se && bds.se.upn && bds.se.upn.cookieset || [];
                var isIE = cookieset[0] && cookieset[0].v === 1;
                return !isIE;
            });

            $(window).one('index_off', function () {
                $namespace.removeClass('soutu-env-newindex');
                $namespace.removeClass('soutu-no-skin');
            });

        },
        show: function () {
            var me = this;
            if (!me.$layer) {
                me.addLayer();
            }
            var $layer = me.$layer;
            me.setState('normal');
            $layer.show();
            me.$graphIcon.hide();
            me.$hoverTip && me.$hoverTip.hide();
            $('#form .bdsug').hide();

            if (window.pageState === 1 && !$namespace.hasClass('soutu-env-result')) {
                $namespace.addClass('soutu-env-result');
            }

            // 修复新首页下极搜到结果页后，ishome变为true   newindex还是为1
            if (lib.getEnv() === 'newindex') {
                $namespace.addClass('soutu-env-newindex');
                if (!window.s_session || !!s_session.userSkinName === false) {
                    $layer.addClass('soutu-no-skin');
                }
                else {
                    $layer.removeClass('soutu-no-skin');
                }
            }

            $namespace.addClass('soutu-env-new');
        },
        close: function () {
            var me = this;
            me.$layer.hide();
            me.$graphIcon.show();
            me.setState('normal');
            // 清掉浮层中的错误提示和输入内容
            me.$urlErrorTip.hide();
            me.$urlInput.val('');
        },
        addLayer: function () {
            var me = this;
            var $layer = me.$layer = $(template.wrapHtml()).prependTo($('#form'));
            me.$urlInput = $layer.find('#soutu-url-kw')
                .on('focus', function () {
                    $layer.find('.soutu-url-layer').addClass('focus');
                })
                .on('blur', function () {
                    $layer.find('.soutu-url-layer').removeClass('focus');
                });

            // 修复新首页，未显示频道时 图片搜索按钮换行问题， 通过 是否展现'显示频道'链接 来判断
            if (lib.getEnv() === 'newindex' && $('.s-lite').not('.hide-icon').length) {
                $layer.find('.soutu-url-btn').css('width', '103px');
            }

            me.$dropArea = $layer.find('.soutu-drop');
            me.$urlErrorTip = $layer.find('.soutu-url-error');
            me.$urlSearchBtn = $layer.find('.soutu-url-btn');
            me.panelHidden = false;

            me.listenLayer();
        },
        handleDrop: function (e) {
            var me = this;
            me.$dropArea.removeClass('drag-over');
            var items;
            if (e.originalEvent.dataTransfer) {
                items = e.originalEvent.dataTransfer.files;// || e.originalEvent.dataTransfer.items;
            }

            if (!items || items.length === 0) {
                var url;
                try {
                    url = e.originalEvent.dataTransfer.getData('text/plain')
                        || e.originalEvent.dataTransfer.getData('text/uri-list');
                }
                catch (err) {
                    url = e.originalEvent.dataTransfer.getData('Text')
                        || e.originalEvent.dataTransfer.getData('URL');
                }

                if (url) {
                    me.handleURL(url);
                }
                else {
                    me.setState('error');
                }
            }
            else {
                var file = items[0];
                me.uptype = 'drag';
                me.upload(file, 'PC_UPLOAD_SEARCH_MOVE');
            }
        },
        listenLayer: function () {
            var me = this;
            var $layer = me.$layer;

            me.$urlInput
                .on('focus', function () {
                    $layer.find('.soutu-url-panel').addClass('focus');
                })
                .on('blur', function () {
                    $layer.find('.soutu-url-panel').removeClass('focus');
                })
                .on('keydown', function (e) {
                    var code = e.keyCode;

                    if (me.$urlErrorTip.css('display') !== 'none') {
                        me.$urlErrorTip.hide();
                    }
                    if (code === 13) {
                        me.handleURL(this.value);

                        e.stopPropagation();
                        e.preventDefault();
                        return false;
                    }
                });

            me.$urlSearchBtn.on('click', function () {
                var url = me.$urlInput.val();
                me.handleURL(url);
            });

            me.$layer.find('.upload-pic').on('change', function () {
                var file = this.files[0];
                if (file) {
                    me.uptype = 'upload';
                    me.upload(file, 'PC_UPLOAD_SEARCH_FILE');
                }
            });

            me.$layer.find('.upload-pic').on('click', function () {
                me.log({
                    rsv_imageclick: 'uploadbtn'
                });
            });

            me.$dropArea
                .on('dragover', function (e) {
                    me.$dropArea.addClass('drag-over');
                    e.stopPropagation();
                    e.preventDefault();
                })
                .on('dragleave', function (e) {
                    me.$dropArea.removeClass('drag-over');
                    e.stopPropagation();
                    e.preventDefault();
                })
                .on('drop', function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    me.handleDrop(e);
                });

            me.$layer.find('.soutu-close').on('click', function () {
                me.close(true);
                me.log({
                    rsv_imageclick: 'close'
                });
            });

            me.$layer.on('click', '.soutu-error-upload', function (e) {
                e.stopPropagation();
                e.preventDefault();

                me.setState('normal');
            });

            $(document).on('click', function (e) {
                var node = e.target;
                var hideFlag = true;
                do {
                    node = node.parentNode;
                    if (node === me.$layer[0] || node === me.$graphIcon[0]) {
                        hideFlag = false;
                        break;
                    }
                }
                while (node.parentNode);

                if (hideFlag) {
                    me.close();
                }
            });
        },
        setNormal: function () {
            this.$layer.find('.soutu-state-normal').show();
            // 清空上次选择的文件
            var uploadBtn = this.$layer.find('.upload-pic');
            uploadBtn.val('');
        },
        setWaiting: function () {
            var me = this;
            me.$layer.append(template.waitingHtml());

            var leftRight = [[0, 40], [20, 20], [40, 0]];
            var colors = ['rgb(55,137,250)', 'rgb(99,99,99)', 'rgb(235,67,70)'];
            me.$layer.find('.b').each(function (i, e) {
                var step = 0;
                $(e).css({'background-color': colors[i]});
                (function ani() {
                    $(e).animate(
                        {
                            left: leftRight[i][step % 2]
                        },
                        {
                            duration: 800,
                            easing: 'swing',
                            progress: function (animation, progress) {
                                if (progress >= 0.5) {
                                    $(e).css({'background-color': colors[(step + i) % 3]});
                                }
                            },
                            complete: function () {
                                ani();
                            }
                        }
                    );
                    step++;
                })();
            });
        },
        setError: function (data) {
            var msg = data.msg || ERROR_MSG[2];
            this.$layer.append(template.errorHtml(msg, data.status));
        },
        setNewTabTip: function (data) {
            var $tip = this.$layer.find('.soutu-state-newtabtip');
            if ($tip.length) {
                $tip.remove();
            }
            $tip = $(template.newTabTipHtml(data));
            this.$layer.append($tip);

            lib.sendLog({
                rsv_imageclick: 'tipForNewTab'
            });
        },
        setState: function (state, data) {
            var me = this;
            me.state = state;

            me.$layer.find('.soutu-state-normal').hide();
            me.$layer.find('.soutu-state-error').remove();
            me.$layer.find('.soutu-state-waiting').remove();
            me.$layer.find('.soutu-state-newtabtip').remove();

            me.$urlErrorTip.hide();

            state = state.charAt(0).toUpperCase() + state.substring(1);
            me['set' + state].apply(me, [data || {}]);
        },
        handleURL: function (url, flag) {
            // check url validate
            if (lib.isURL(url)) {
                this.$urlInput.val(url);
                this.setState('normal');
                this.$urlErrorTip.hide();
                this.uploadUrl(url);
                this.log({
                    rsv_imageclick: 'searchurl-success'
                });
            }
            else {
                this.setState('normal');
                this.$urlErrorTip.show();
                this.log({
                    rsv_imageclick: 'searchurl-error'
                });
            }
        },
        openResutlPage: function (url) {
            var me = this;
            var target = $('#form').attr('target');
            if (target === '_blank') {
                var text = '图片上传完毕，根据您的搜索习惯，<br/>将打开新窗口展示搜索结果';
                var player = window.player;
                if (player && player.config && player.config.play.on) {
                    text = '您正在听音乐，为了不打扰您继续听音乐，<br/>将打开新窗口查看搜索结果';
                }
                if (!$.isString(me.uploadObj)) {
                    lib.blobtoBase64(me.uploadObj, function (dataurl) {
                        me.setState('newTabTip', {
                            text: text,
                            imgUrl: dataurl,
                            url: url
                        });
                    });
                }
                else {
                    me.setState('newTabTip', {
                        text: text,
                        imgUrl: me.uploadObj,
                        url: url
                    });
                }
            }
            else {
                location.href = url;
                me.close();
            }
        },
        validate: function (file) {
            var allow = ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'webp'];
            var arr = file.name.split('.');
            var ext = arr.pop().toLowerCase();

            if (!file.type || !ext || $.inArray(ext, allow) === -1) {
                return 1;
            }

            if (file.size > MAXSIZE) {
                return 3;
            }

            return 0;
        },
        doAjax: function (data) {
            var me = this;

            if (this.state !== 'waiting') {
                this.setState('waiting');
            }

            $.ajax({
                url: uploadServer,
                type: 'POST',
                data: data,
                // 必须false才会避开jQuery对 formdata 的默认处理
                // XMLHttpRequest会对 formdata 进行正确的处理
                processData: false,
                // 必须false才会自动加上正确的Content-Type
                contentType: false,

                success: function (e) {
                    me.uploadComplete(e);
                },
                error: function () {
                    me.setState('error');
                },
                always: function () {}
            });
        },

        uploadUrl: function (url) {
            var me = this;
            me.uploadObj = url;

            // var query = [
            //     'queryImageUrl=' + encodeURIComponent(url),
            //     'uptype=urlsearch'
            // ].join('&');

            this.log({
                rsv_imageclick: 'uploadurl'
            });

            me.upload(url, 'PC_UPLOAD_SEARCH_URL');
            // setTimeout(function () {
            //     me.openResutlPage('http://image.baidu.com/n/pc_search?' + query);
            // }, 10);
        },

        upload: function (file, source) {
            var me = this;

            if (source !== 'PC_UPLOAD_SEARCH_URL') {
                var statusCode = me.validate(file);
                if (statusCode) {
                    me.setState('error', {
                        msg: ERROR_MSG[statusCode],
                        status: statusCode
                    });
                    return;
                }
                me.log({
                    rsv_imageclick: 'uploadfile'
                });

                require(['image-compress-browser'], function(compressImage) {
                    compressImage(file, function (newFile, isCompressed) {
                        me.uploadObj = newFile;
                        me.$urlInput.val('');
                        me.uploadProcess(newFile, source);
                    }, compressOpt);
                });
            }
            else {
                me.uploadProcess(file, source);
            }
        },

        uploadProcess(file, source) {
            var me = this;

            me.setState('waiting');
            var page = window.pageState === 0 ? '{"page_from": "searchIndex"}' : ' {"page_from": "searchResult"}';

            var formData = new FormData();
            formData.append('image', file);
            formData.append('tn', 'pc');
            formData.append('from', 'pc');
            formData.append('image_source', source);
            formData.append('range', page);
            formData.append('sdkParams', me.shituSdkParams || '');

            me.doAjax(formData);
        },

        uploadComplete: function (res) {
            var me = this;
            if (res.status === 0) {
                setTimeout(function () {
                    window.location.href = res.data.url;
                }, 30);
            }
            else {
                me.setState('error');
            }
        },
        antispam: function (url) {
            var me = this;
            if (!me.shituSdkParams) {
                // 安全部门要求子渠道（必须）http://wiki.baidu.com/pages/viewpage.action?pageId=773880935
                window['__abbaidu_2033_subidgetf'] = function () {
                    return 'www_pc';
                };
                // 处理上报返回数据
                window['__abbaidu_2033_cb'] = function (responseData) {
                    me.shituSdkParams = responseData;
                };
                // 接入百度识瞳 识别爬虫流量保护自有的数据
                lib.loadScript('https://dlswbr.baidu.com/heicha/mw/abclite-2033-s.js');
            }
        },
        log: lib.sendLog
    };

    soutu.init();

    if (typeof define === 'function') {
        // define('soutuIndex', [], function () {
        define('soutu/js/tu', ['require'], function (require) {
            return soutu;
        });
    }
})();
/* eslint-enable fecs-camelcase*/
