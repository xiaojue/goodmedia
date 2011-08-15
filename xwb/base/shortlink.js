(function(X, Util, $){
/**
 * @class Xwb.ax.Shortlink
 * 短链接解析相关函数，包含短链接的识别，缓存，解析，结合DOM渲染等操作。<br/>
 * 目前短链有三个类型：<br/>
 * 1. 新浪http://t.cn短链<br/>
 * 2. 新浪http://sinaurl.cn短链，兼容处理<br/>
 * 3. Xweibo站点自定义短链<br/>
 用法：
* <pre><code>
    // 指明要解析的短链前缀
    var shortlink = new Xwb.ax.Shortlink({ local:'http://xweibourl.cn' });
    
    var testUrl = 'http://xweibourl.cn/aBcDeF';
    
    // true
    shortlink.is(testUrl);
    
    testUrl = 'a text including http://xweibourl.cn/aBcDeF,http://xweibourl.cn/DefGHE';
    
    // 返回['aBcDeF','DefGHE']
    shortlink.search(testUrl);
    
    // 处理HTML元素中包含短链的a元素
    shortlink.render('#divId', function(urlInfo, aHrefElement){
            aHrefElement.title = urlInfo.url;
    });
 </code></pre>
  urlInfo结构以视频为例如下：
* <pre><code>
    {
        // 实际地址
        url :	"http://x.xweibo.com/pr...Y6XTWIwA/?rpid=58114392",
        // url类型，有url,music,video等
        type : "video",
        // 标题
        title : "还珠伤感",
        // 缩略图
        screen : "http://i01.img.tudou.co...mgs/i/072/911/086/p.jpg",
        // 视频地址
        flash : "http://www.tudou.com/v/wzLY6XTWIwA/v.swf",
        mp4:"",
        // 图标
        icon : "http://img.t.sinajs.cn/...ommon/feedvideoplay.gif"
    }
 </code></pre>

 其它用法参见方法说明。
 */
X.ax.Shortlink = function(cfg){
    $.extend(this, cfg);
    
    // URL缓存
    this._c = {};
};

X.ax.Shortlink.prototype = {
    
    EXTERNAL_URL : 'http://t\\.cn|http://sinaurl\\.cn',
    /**
     * @cfg {String} local 指定本地短链接前缀
     */
    local : '',
    
    _getReg : function(index){
        var slReg = this.slReg;
        if(!slReg){
            var local = this.local;
            slReg = this.slReg = [local ?
                        new RegExp('(?:' + local.replace('.','\\.') + '|'+this.EXTERNAL_URL+')/([0-9a-z]+)','gi'):
                        new RegExp('(?:' + this.EXTERNAL_URL+')/([0-9a-z]+)','gi'), local?
                        new RegExp('(?:' + local.replace('.','\\.') + '|'+this.EXTERNAL_URL+')/([0-9a-z]+)','i'):
                        new RegExp('(?:'+this.EXTERNAL_URL+')/([0-9a-z]+)','i')
            ];
        }
        return slReg[index];
    },
    
    /**
     * 获得缓存中的URL信息，数据格式为{urlShortId:urlInfo}
     * @return {Object}
     */
    getUrls : function(){
        return this._c;
    },
    
    /**
     *  从给定文本内查找所有短链接，返回包含短链接ID字符串的数组。
     * 
    * <pre><code>
        var text = 'Xweibo,2011 go go go!http://testurl.cn/xweibo_trunk/hBACWI';
        var urls = search(text);
        结果：['hBACWI']
     </code></pre>

     * @param {String} text
     * @return {Array}
     */
    search : function(text){
        var urls = [];
        if(text){
            var slReg = this._getReg(0);
            // reuse slReg
            while((slReg.exec(text)) != null){
                urls.push( RegExp.$1 );
            }
        }
        return urls;
    },
    /**
     * 判断给定的URL是否为短链接格式，如果为短链接，返回该链接接字符串ID。
    * <pre><code>
            var text = 'http://testurl.cn/xweibo_trunk/hBACWI';
            var linkId;
            if((linkId=is(text))){
                // hBACWI
                alert(linkId);
            }
     </code></pre>
     * @param {String} url
     * @return {Boolean|String}
     */
    is : function(url){
        var is = this._getReg(1).test(url);
        return is && RegExp.$1;
    },
    /**
     * 解析来自微博列表数据的短链接，解析完毕后只回调一次callback。<br/>
     * 目前微博数据中的短链接主要来自内容区，包括自身内容与转发内容(wbData.tx, wbData.rt.tx)和微博客户端终端类型区(wbData.s)。<br/>
     * 方法执行来将已解析的短链数据缓存在参数list的shortlinks属性中，它是一个数组，
     * 该数组内的短链可能重复，因为一微博内可存在多个重复的短链接。<br/>
     * <b>如果链接无效，shortlinkInfo属性为null。</b><br/>
     * shortlinkInfo结构为数组+HASH形式，既可遍历，又可根据链接URL快速定位链接信息。<br/>
     * 数组元素数据格式为
    * <pre><code>
        {
          shortlinks : [
            // 短链信息
            shortlinkInfo,
            // 该短链是否来自转发区
            true
          ],
          //...
        }
     </code></pre>
     * callback 回调的参数为(wbData, shortlinks)<br/>
     * shortlinks格式为[ [shorlinkInfo, isForward], ... ],
     * shortlinkInfo为上面shortlinks中的元素<br/>
     * isForward 指明该短链是否来自转发内容。<br/>
     * @param {Object} weiboListDataMap
     * @param {Function} callback
     */
    from : function(list, callback){
        var 
            // 临时hash检测是否重复
            tmp = {},
            // 未查询的短链
            reqUrls = [],
            arr, i, len, u, wbu;
        
        for(var id in list){
            wbu = list[id].shortlinks = [];
            // 内容区
            arr = this.search(list[id].tx);
            for(i=0,len=arr.length;i<len;i++){
                u = arr[i];
                if(!tmp[u]){
                    tmp[u] = true;
                    reqUrls.push(u);
                }
                wbu.push([u]);
            }
            
            // 转发区
            if(list[id].rt){
                arr = this.search(list[id].rt.tx);
                for(i=0,len=arr.length;i<len;i++){
                    u = arr[i];
                    if(!tmp[u]){
                        tmp[u] = true;
                        reqUrls.push(u);
                    }
                    wbu.push([u, true]);
                }
            }
            // 终端类型区
            if(list[id].s){
                arr = this.search(list[id].s);
                for(i=0,len=arr.length;i<len;i++){
                    u = arr[i];
                    if(!tmp[u]){
                        tmp[u] = true;
                        reqUrls.push(u);
                    }
                    wbu.push([u]);
                }
            }
        }
        
        this.info(reqUrls, function(cache){
            // 将获得的短链详细数据填入shortlinks内
            for(var id in list){
                var sl = list[id].shortlinks;
                var u;
                for(var i=0,len=sl.length;i<len;i++){
                    u = sl[i][0];
                    // 可能存在无效短链
                    if(cache[u]){
                        sl[i][0] = cache[u];
                        cache[u].id = u;
                    }else sl[i][0] = null;
                    sl[u] = sl[i];
                }
            }
            callback(list);
        });
    },
    /**
     * 查询给定短链接ID数组中所有短链接的信息。<br/>
     * 如果短链接信息已缓存，优先使用缓存数据。
     * @param {Array} urls 短链接数组，如['hBACWI','hBAWEF',...]
     * @param {Function} callback 查询结束后回调，参数为库已缓存的所有短链接map数据。
     */
    info : function(urls, callback){
        // 缓存点
        var gbl = this._c;

        for(var len=urls.length-1;len>=0;len--){
            if(gbl[urls[len]]){
                Util.arrayRemove(urls, len);
            }
        }
        
        if(urls.length){
            X.request.sinaurl(urls.join(','), function(e) {
                if(e.isOk()){
                    // 这里后台API返回格式不一致！?????
                    $.each(e.raw.data, function(sid, dat){
                        if(!gbl[sid])
                            gbl[sid] = dat;
                    });
                    callback(gbl);
                }
            });
        }else callback(gbl);
    },
    
    /**
     * 查找给定DOM元素内所有的短链接a元素，利用renderer参数回调处理这些元素。<br/>
     * 方法会查找元素中中包含短链接的a标签元素，获得所有短链接，查询短链接缓存，如未缓存，
     * 发起API请求解析未缓存的短链接。<br/>
     * 方法可自行处理给定元素结点内所有包含短链的A元素。<br/>
     * 某个元素里所有的短链接加上提示真实地址：
     * <pre><code>
     * render('#divId', function(urlInfo, aHrefElement){
            aHrefElement.title = urlInfo.url;
       });
     *</code></pre>
     * @param {jQuery|HTMLElement} scopeElement
     * @param {Function} renderer ，调用参数为 renderer( shortlinkInfo, aHrefElement )
     */
    render : function(jqItem, renderer){
        var links = $(jqItem).find('a'),
            self = this, 
            urls = [], tmp=[];
        
        links.each(function(){
            if((sl = self.is(this.href))){
                urls.push([sl, this]);
                tmp.push(sl);
            }
        });
        
        this.info(tmp, function(infos){
            // got all shortlink
            for(var i=0,len=urls.length;i<len;i++){
                var info =  infos[urls[i][0]];
                renderer(info, urls[i][1]);
            }
        });
    }
};


})(Xwb, Xwb.util, $);