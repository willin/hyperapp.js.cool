function getTimestamp() {return parseInt(new Date() / 1000, 10);
}
function setReadState() {
  localStorage.setItem('hyperapp.url', location.href);
  localStorage.setItem('hyperapp.top', document.documentElement.scrollTop || document.body.scrollTop);
  setTimeout(setReadState, 5000);
}
function getReadState() {
  if (window.localStorage) {
    if (document.referrer === '') {
      var url = localStorage.getItem('hyperapp.url');
      if (!!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) && url && location.href !== url) {
        location.href = url;
        setTimeout(window.scrollTo(0, ~~localStorage.getItem('hyperapp.top')), 300);
      }
      setTimeout(setReadState, 5000);
    }
  }
}

// Docsify 配置
window.$docsify = {
  name: '从0到1掌握Hyperapp',
  repo: 'https://github.com/willin/hyperapp.js.cool.git',
  loadSidebar: true,
  subMaxLevel: 2,
  formatUpdated: '{YYYY}-{MM}-{DD} {HH}:{mm}',
  executeScript: true,
  auto2top: true,
  alias: {
    '/basic/_sidebar.md': '/_sidebar.md',
    '/hyperapp/_sidebar.md': '/_sidebar.md',
    '/fx/_sidebar.md': '/_sidebar.md',
    '/i18n/_sidebar.md': '/_sidebar.md',
    '/router/_sidebar.md': '/_sidebar.md'
  },
  search: {
    placeholder: '搜索',
    noData: '未找到结果'
  },
  plugins: [
    function (hook, vm) {
      hook.init(function () {
        getReadState();
        if (typeof mermaid !== 'undefined') { mermaid.initialize({ startOnLoad: false }); }
        var adScript = document.createElement('script');
        adScript.src = '//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        adScript.setAttribute('async', true);
        document.body.appendChild(adScript);
      });
      hook.beforeEach(function (md) {
        var url = 'https://github.com/willin/hyperapp.js.cool/blob/master' + vm.route.file
        var editUrl = '[:memo: 编辑本章节](' + url + ')\n'
        return md
          + '\n----\n'
          + '最后更新 {docsify-updated}'
          + editUrl
      });
      hook.doneEach(function () {
        if (typeof mermaid !== 'undefined') { mermaid.init(undefined, '.mermaid') };
        var main = document.getElementById('main');
        var paragraphs = main.getElementsByTagName('p');
        var ads = [];
        if (paragraphs.length > 15) {
          ads.push(paragraphs[Math.ceil(Math.random() * 15)]);
        }
        ads.push(paragraphs[paragraphs.length - 1]);
        for (var i = 0; i < ads.length; i += 1) {
          ads[i].insertAdjacentHTML('afterend', '<ins class="adsbygoogle"style="display:block;margin: 1.5em auto;"data-ad-client="ca-pub-5059418763237956"data-ad-slot="9518721243"data-ad-format="auto"></ins>');
          (adsbygoogle = window.adsbygoogle || []).push({});
        }
        ga('send', 'pageview', location.hash.replace('#', ''));
      });
    }
  ],
  markdown: {
    renderer: {
      code: function (code, lang) {
        var html = '';
        if (code.match(/^sequenceDiagram/) || code.match(/^graph/) || code.match(/^gantt/)) {
          html = '<div class="mermaid">' + code + '</div>';
        }
        var hl = Prism.highlight(code, Prism.languages[lang] || Prism.languages.markup)
        return html + '<pre v-pre data-lang="' + lang + '"><code class="lang-'+ lang +'">'+ hl +'</code></pre>'
      }
    }
  }
};
// 离线浏览
if (typeof navigator.serviceWorker !== 'undefined') {
  navigator.serviceWorker.register('sw.js');
}

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
ga('create', 'UA-33096931-4', 'auto');
ga('send', 'pageview');
