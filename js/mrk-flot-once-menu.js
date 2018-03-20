/* -----------------------------------------------
/* Author : jiangbaojun
/* Demo
/* GitHub : https://github.com/jiangbaojun/mrk-flot-once-menu.git
/* How to use? : Check the GitHub README
/* v1.0
/* ----------------------------------------------- */


/**
 * 折叠展开菜单，指定级别开始浮动
 * 数据说明：
 *      1、采用扁平树数据
 *      2、字段说明，iconSrc和iconClass，优先使用iconSrc，可同时为空（没有图标）
 *          id:             菜单节点id,
 *          parentId:       当前节点父级节点id,
 *          title:          菜单标题文本,
 *          iconSrc:        菜单文本前面的图片,
 *          iconClass:      菜单文本前面的font-awesome字体class，如用户图标fa-user,
 *          url:            菜单对应的页面地址,
 *          orderNum:       同级别的排序数字，1开始，越大越靠后
 *  使用说明：
 *     格式： $(selector).mrkMenu(options);
 *     参数说明：
 *          1、selector 选择器，生成菜单的外层容器
 *          2、options：
 *                  menuData：           菜单数据，默认[]
 *                  menuRootId：         菜单根节点id，控件根据该id，生成所有子节点的菜单,默认""
 *                  startFloatLevel：    开始浮动的菜单层级，number，从2开始取值（1级菜单固定，不允许浮动）。默认0，不浮动
 *                  retract：            子菜单缩进像素值（number），默认20
 *                  foldTime：           子菜单折叠动画时间值（number，毫秒），默认200
 *                  unFoldTime：         子菜单展开动画时间值（number，毫秒），默认200
 *                  headerText：         菜单header文本，默认"",
 *                  onlyUnfold ：        一级菜单是否始终只展开一个节点，默认true
 *                  remberFlodState ：   是否记住子节点的折叠展开状态，默认false
 *                  searchResultToTree： 每次过滤搜索，是否以树形展示过滤结果，默认false
 *                  onClickMenu:	     事件，点击菜单节点时的回调函数。
 *                                          function(data)，data为回调函数参数，object，字段如下：
 *                                              direct:     是否是最底层节点（没有子菜单，直接的菜单项）
 *                                              level:      当前点击的菜单级别，从1开始
 *                                              data:       点击的菜单节点数据
 *                                              e:e         原始event对象
 *
 *  暴露方法：
 *  	search：过滤搜索菜单，并重新渲染
 *  		用法：$(selector).mrkMenu("search",searchText)
 *  	getFilterData：	根据搜索条件,返回过滤菜单数据
 *          用法：$(selector).mrkMenu("getFilterData",searchText)
 *
 *
 * @author jiangbaojun
 * @version V1.0
 */
(function ($) {
    /**
     * jQuery扩展控件方法
     * @param options   自定义配置选项
     * @param params    暴露方法参数
     */
    $.fn.mrkMenu = function (options, params) {
    	//扩展方法
        if (typeof options == "string") {
            var method = $.fn.mrkMenu.methods[options];
            if (method) return method(this, params);
        }
    	//扩展默认配置选项数据
    	extendDefault(this, options);
        //初始化控件
        init(this, params);
    };
    /**
     * 控件暴露方法
     */
    $.fn.mrkMenu.methods = {
        /**
         * 根据过滤条件,刷新菜单
         * @param target    target
         * @param text      过滤文本
         */
		"search": function(target, text){
			activeOptions.searchText = text;
			//根据搜索条件过滤菜单数据
	        activeOptions = filterMenuData(activeOptions);
			init(target, text);
		},
		"getFilterData": function(target, text){
			//根据搜索条件,返回过滤菜单数据
            return getFilterData(activeOptions.originData, text)
		}
	};
    /**
     * 控件默认配置选项
     */
    $.fn.mrkMenu.defaultOptions = {
        menuData: [],
        menuRootId: "",
        startFloatLevel: 0,
        retract: 20,
        headerText: "",
        unFoldTime: 200,
        foldTime: 200,
        remberFlodState: false,
        onlyUnfold: true,
        searchResultToTree: false,
        onClickMenu: function(target){}
    };
    var activeOptions = $.fn.mrkMenu.defaultOptions;
    
    /**
     * 扩展默认配置选项数据
     * @param options   初始化配置选项，用于替换控件默认配置选项
     */
    function extendDefault(target, options){
    	//不可自定义默认配置
    	var innerDefaultOptions = {
			menuStartIndex: 1,
			searchText: "",
			originData: options.menuData,
			originTarget: target,
			originMenuRootId: options.menuRootId,
			searchPid: "search-root"
    	};
        //扩展自定义配置
        var opts = $.extend({}, $.fn.mrkMenu.defaultOptions);
        activeOptions = $.extend(true, opts, options, innerDefaultOptions);
    }
    /**
     * 初始化浮动展开菜单
     * @param target    目标菜单容器
     * @param params    暴露方法参数
     */
    function init(target, params){
        //清除旧的菜单内容
        target.html("");
        createMenus(target,activeOptions.menuRootId,activeOptions.menuStartIndex);
    }
    
    /**
     * 根据搜索条件过滤菜单数据
     * @param activeOptions  控件输入参数
     */
    function filterMenuData(activeOptions){
    	var searchText = activeOptions.searchText;
    	var menuData = activeOptions.originData;
    	if(searchText==null || searchText==undefined || searchText==""){
            activeOptions.menuData = activeOptions.originData;
            activeOptions.menuRootId = activeOptions.originMenuRootId;
    		return activeOptions;
    	}
        var filterData = getFilterData(menuData, searchText);
    	if(activeOptions.searchResultToTree){
    		//树形结果展示，需要获得所有父节点
    		activeOptions.menuData = getAllParents(filterData);
    	}else{
    		activeOptions.menuRootId = activeOptions.searchPid;
    		activeOptions.menuData = filterData;
    	}
    	return activeOptions;
    }

    /**
     * 根据过滤条件，获得直接节点数据
     * @param menuData      菜单数据
     * @param searchText    搜索文本
     * @returns {*}
     */
    function getFilterData(menuData, searchText){
        if(searchText==null || searchText==undefined || searchText==""){
            return menuData;
        }
        var filterData = [];
        var reg = new RegExp(searchText);
        //获得所有直接节点数组
        for(var i=0;i<menuData.length;i++){
            var item = menuData[i];
            if(reg.test(item.title) && !hasChildren(menuData,item.id)){
                if(!activeOptions.searchResultToTree){
                    item.parentId=activeOptions.searchPid;
                }
                filterData.push(item);
            }
        }
        return filterData;
    }

    /**
     * 判断当前节点是否有子节点
     * @param menuData  菜单数据
     * @param id  		当前节点id
     */
    function hasChildren(menuData,id){
    	for(var i=0;i<menuData.length;i++){
    		var item = menuData[i];
    		if(item.parentId == id){
    			return true
    		}
    	}
    	return false;
    }
    
    /**
     * 获得给定节点数组的所有父节点
     * @param filterData  给定节点数组
     */
    function getAllParents(filterData){
    	var resultArr = filterData;
    	var noRepeatPids = [];
    	for(var i=0;i<filterData.length;i++){
    		var item = filterData[i];
    		//filterData内相同父节点的节点，获得一次就可以
    		if(!containItem(noRepeatPids, item.parentId)){
    			noRepeatPids.push(item.parentId);
    			var parentNodes = getParents(item,[]);
    			//去除重复节点
    			for(var k=0;k<parentNodes.length;k++){
    				if(!containNode(resultArr, parentNodes[k])){
    					resultArr.push(parentNodes[k]);
    				}
    			}
    		}
    	}
    	return resultArr;
    }
    
    /**
     * 数组包含判断
     */
    function containItem(ids, id){
    	for(var i=0;i<ids.length;i++){
    		if(ids[i] == id){
    			return true;
    		}
    	}
    	return false;
    }
    
    /**
     * 节点包含判断
     */
    function containNode(arr, item){
    	for(var i=0;i<arr.length;i++){
    		if(arr[i].id == item.id){
    			return true;
    		}
    	}
    	return false;
    }
    
    /**
     * 获得给定节点的所有父节点,不包含当前节点
     * @param item  给定节点
     * @param result  累加结果数据
     */
    function getParents(item,result){
    	var menuData = activeOptions.originData;
    	var parentNode = null;
    	for(var i=0;i<menuData.length;i++){
    		var temp = menuData[i];
    		if(temp.id == item.parentId){
    			parentNode= temp;
    			break;
    		}
    	}
    	if(parentNode != null){
    		result.push(parentNode);
    		getParents(parentNode,result);
    	}
    	return result;
    }
    
    /* 创建菜单dom元素
    * @param target     菜单根节点jquery对象
    * @param id         菜单数据根节点id值
    * @param j          用于class名称，表示每级菜单的level。该参数定义初始级别，然后累加
    * @user: jiangbaojun
    */
    function createMenus(target, id, j){
        var self = this;
        //折叠展开flod菜单标识class
        var tagClassMd = "md";
        //浮动flot菜单标识class
        var tagClassMt = "mt";
        //第一个flot菜单表示
        var tagClassMdt = "mdt";
        if(target===undefined||target==null){
            return;
        }
        if(j==activeOptions.menuStartIndex){
            target = $('<ul />').addClass("menu-root").appendTo(target);
            target.addClass('treeview-level-'+j++);
            target.html("");
            target.append('<li class="header">'+activeOptions.headerText+'</li>');
        }
        var data=activeOptions.menuData;
        var rootMenu = $.grep(data, function (n) {
            if (n.parentId == id)
                return true;
        });
        if(!rootMenu.length) return;
        //sort(排序)
        rootMenu.sort(function (a, b) {
            return a.orderNum - b.orderNum;
        });
        if(j-1<activeOptions.startFloatLevel || activeOptions.startFloatLevel<2) {
            target.addClass(tagClassMd);
        }else{
            target.addClass(tagClassMt);
            if(j-1==activeOptions.startFloatLevel){
                target.addClass(tagClassMdt);
            }
        }
        //add menu node（插入同级菜单节点）
        $.each(rootMenu, function () {
            var that = this;
            //判断是折叠展开菜单，还是浮动菜单(注意是递归前调用j-1)
            if(j-1<activeOptions.startFloatLevel || activeOptions.startFloatLevel<2) {
            /******************************* flod菜单 *********************************************/
                var li = $('<li />').addClass("treeview "+tagClassMd).appendTo(target);
                $("<div/>").addClass("hover-sign "+tagClassMd).appendTo(li);
                var li_a = $('<a/>').attr({"href": this.url || "#", "menuId": this.id})
                    .addClass(this.url === '' ? '' : 'menu-item')
                    .addClass(tagClassMd)
                    .appendTo(li);
                // 菜单前的图标优先使用图片
                if (this.iconSrc) {
                    $("<img/>").attr("src", this.iconSrc).addClass("menu-icon "+tagClassMd).appendTo(li_a);
                } else if (this.iconClass) {
                    $('<i/>').addClass("md fa " + this.iconClass || "").appendTo(li_a);
                } else {
                    li_a.addClass("no-icon");
                }
                // title
                $('<span class="menu-text '+tagClassMd+'" />').text(this.title).appendTo(li_a);

                var childrenUL = $('<ul class="treeview-menu" />');
                createMenus(childrenUL, that.id, j + 1);
                if (childrenUL.children().length) {
                    li.addClass("dropdown-menu");
                    childrenUL.addClass('treeview-level-' + j);
                    //子级菜单缩进
                    if(j!=activeOptions.startFloatLevel){
                        var retractNum = (j - 1) * Number(activeOptions.retract);
                        childrenUL.find(">li>a").css("padding-left", retractNum + "px");
                    }
                    childrenUL.appendTo(li);
                    li_a.attr('href', 'javascript:void(0)');
                    li_a.removeClass('menu-item');
                    //arrows
                    var arrowTag = tagClassMd;
                    if(j==activeOptions.startFloatLevel){
                        //标识子菜单浮动的arrow
                        arrowTag = tagClassMd+" "+tagClassMdt;
                    }
                    $('<span class="arrow fold '+arrowTag+'"></span>').appendTo(li_a);
                    //菜单选项添加事件-目录菜单项
                    li.on('click', function (e) {
                        activeOptions.onClickMenu.call(li, {direct: false, level: j - 1, data: that, e: e});
                        activeOptions.originTarget.find("li>a").removeClass("selected");
                        $(this).find(">a").addClass("selected");
                        $(this).parentsUntil(activeOptions.originTarget, "li").find(">a").addClass("selected");
                        //是否已经展开
                        if (!$(this).hasClass("open")) {
                            //父级节点未展开，且单节点展开，折叠其他菜单（去掉open属性）
                            if (activeOptions.onlyUnfold && li.closest("li.open").length < 1) {
                                var foldSelector = "";
                                if (activeOptions.remberFlodState) {
                                    //只折叠一级菜单选择器
                                    foldSelector = ">ul>li.md";
                                } else {
                                    //折叠所有菜单选择器
                                    foldSelector = "li.md";
                                }
                                activeOptions.originTarget.find(foldSelector).find(">ul").slideUp(activeOptions.foldTime);
                                activeOptions.originTarget.find(foldSelector).removeClass("open");
                            }
                            //展开当前
                            li.find(">ul").slideDown(activeOptions.unFoldTime);
                            $(this).addClass("open");
                        } else {
                            $(this).find(">ul").slideUp(activeOptions.foldTime);
                            $(this).removeClass("open");
                        }
                        e.preventDefault();
                        e.stopPropagation();
                    });
                } else {
                    li.addClass("direct-menu");
                    //菜单选项添加事件-直接菜单项
                    li.on('click', function (e) {
                        activeOptions.onClickMenu.call(li, {direct: true, level: j - 1, data: that, e: e});
                        activeOptions.originTarget.find("li>a").removeClass("selected");
                        $(this).find(">a").addClass("selected");
                        $(this).parentsUntil(activeOptions.originTarget, "li").find(">a").addClass("selected");
                        e.preventDefault();
                        e.stopPropagation();
                    });
                }
                li.hover(function (e) {
                    if (childrenUL.children().length && j==activeOptions.startFloatLevel){
                        $(this).addClass("open");
                        $(this).find(">ul").slideDown(0);
                    }
                    activeOptions.originTarget.find("li.md").removeClass("hover-on");
                    $(this).addClass("hover-on");
                }, function (e) {
                    if (childrenUL.children().length && j==activeOptions.startFloatLevel){
                        $(this).removeClass("open");
                        $(this).find(">ul").slideUp(0);
                    }
                    activeOptions.originTarget.find("li.md").removeClass("hover-on");
                });
            }else{
                /******************************* flot菜单 *********************************************/
                var tagClassTempMt = tagClassMt;
                if(j-1==activeOptions.startFloatLevel){
                    tagClassTempMt = tagClassMt+" "+tagClassMdt;
                    //第一级浮动菜单target
                    target.on("click", function(e){
                        e.preventDefault();
                        e.stopPropagation();
                    });
                }
                var li = $('<li />').addClass("treeview "+tagClassTempMt).appendTo(target);
                $("<div/>").addClass("hover-sign "+tagClassTempMt).appendTo(li);
                var li_a = $('<a/>').attr({"href": this.url || "#", "menuId": this.id})
                    .addClass(this.url === '' ? '' : 'menu-item')
                    .addClass(tagClassTempMt)
                    .appendTo(li);
                // 菜单前的图标优先使用图片
                if (this.iconSrc) {
                    $("<img/>").attr("src", this.iconSrc).addClass("menu-icon "+tagClassTempMt).appendTo(li_a);
                } else if (this.iconClass) {
                    $('<i/>').addClass("mt fa " + this.iconClass || "").appendTo(li_a);
                } else {
                    li_a.addClass("no-icon");
                }
                // title
                $('<span class="menu-text '+tagClassTempMt+'" />').text(this.title).appendTo(li_a);

                var childrenUL = $('<ul class="treeview-menu" />');
                createMenus(childrenUL, that.id, j + 1);
                if (childrenUL.children().length) {
                    li.addClass("dropdown-menu");
                    childrenUL.addClass('treeview-level-' + j);

                    // //子级菜单缩进
                    // var retractNum = (j - 1 - activeOptions.startFloatLevel) * Number(activeOptions.retract);
                    // childrenUL.find(">li>a").css("padding-left", retractNum + "px");

                    childrenUL.appendTo(li);
                    li_a.attr('href', 'javascript:void(0)');
                    li_a.removeClass('menu-item');
                    //arrows
                    $('<span class="arrow fold '+tagClassTempMt+'"></span>').appendTo(li_a);
                    //菜单选项添加事件-目录菜单项
                    li.on('click', function (e) {
                        activeOptions.onClickMenu.call(li, {direct: false, level: j - 1, data: that, e: e});
                        activeOptions.originTarget.find("li>a").removeClass("selected");
                        $(this).find(">a").addClass("selected");
                        $(this).parentsUntil(activeOptions.originTarget, "li").find(">a").addClass("selected");
                        e.preventDefault();
                        e.stopPropagation();
                    });
                } else {
                    li.addClass("direct-menu");
                    //菜单选项添加事件-直接菜单项
                    li.on('click', function (e) {
                        activeOptions.onClickMenu.call(li, {direct: true, level: j - 1, data: that, e: e});
                        activeOptions.originTarget.find("li>a").removeClass("selected");
                        $(this).find(">a").addClass("selected");
                        $(this).parentsUntil(activeOptions.originTarget, "li").find(">a").addClass("selected");
                        e.preventDefault();
                        e.stopPropagation();
                    });
                }
                li.hover(function (e) {
                    activeOptions.originTarget.find("li.mt").removeClass("hover-on");
                    $(this).addClass("hover-on");
                    e.preventDefault();
                    e.stopPropagation();
                }, function (e) {
                    activeOptions.originTarget.find("li.mt").removeClass("hover-on");
                });
            }
        });
    }
    /**
     * 获得页面可见高度
     * @returns {{width: *, height: *}}
     */
    function getViewPort() {
        var e = window,
            a = 'inner';
        if (!('innerWidth' in window)) {
            a = 'client';
            e = document.documentElement || document.body;
        }

        return {
            width: e[a + 'Width'],
            height: e[a + 'Height']
        };
    }
})(jQuery);
