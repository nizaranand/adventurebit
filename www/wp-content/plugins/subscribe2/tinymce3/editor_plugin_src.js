(function() {
	tinymce.create('tinymce.plugins.Subscribe2Plugin', {
		init : function(ed, url) {
			var pb = '<img src="' + url + '/../../include/trans.gif" class="mceSubscribe2 mceItemNoResize" />',
			cls = 'mceSubscribe2',
			sep = ed.getParam('subscribe2_separator', '[subscribe2]'),
			pbRE;

			pbRE = new RegExp(sep.replace(/[\?\.\*\[\]\(\)\{\}\+\^\$\:]/g, function(a) {
				return '\\' + a;
			}), 'g');

			// Register commands
			ed.addCommand('mceSubscribe2', function() {
				ed.execCommand('mceInsertContent', 0, pb);
			});

			// Register buttons
			ed.addButton('subscribe2', {
				title : 'Insert Subscribe2 Token',
				image : url + '/../include/s2_button.png',
				cmd : cls
			});

			ed.onInit.add(function() {
				ed.dom.loadCSS(url + "/css/content.css");

				if (ed.theme.onResolveName) {
					ed.theme.onResolveName.add(function(th, o) {
						if (o.node.nodeName == 'IMG' && ed.dom.hasClass(o.node, cls))
							o.name = 'subscribe2';
					});
				}
			});

			ed.onClick.add(function(ed, e) {
				e = e.target;

				if (e.nodeName === 'IMG' && ed.dom.hasClass(e, cls))
					ed.selection.select(e);
			});

			ed.onNodeChange.add(function(ed, cm, n) {
				cm.setActive('subscribe2', n.nodeName === 'IMG' && ed.dom.hasClass(n, cls));
			});

			ed.onBeforeSetContent.add(function(ed, o) {
				o.content = o.content.replace(pbRE, pb);
			});

			ed.onPostProcess.add(function(ed, o) {
				if (o.get)
					o.content = o.content.replace(/<img[^>]+>/g, function(im) {
						if (im.indexOf('class="mceSubscribe2') !== -1)
							im = sep;

						return im;
					});
			});
		},

		getInfo : function() {
			return {
				longname : 'Insert Subscribe2 Token',
				author : 'Matthew Robinson',
				authorurl : 'http://subscribe2.wordpress.com',
				infourl : 'http://subscribe2.wordpress.com',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('subscribe2', tinymce.plugins.Subscribe2Plugin);
})();