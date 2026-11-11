'use strict';
'require view';

/* LuCI view: shows the MonoWordTest page (plain static files) inside the LuCI layout. */
return view.extend({
	handleSaveApply: null,
	handleSave: null,
	handleReset: null,

	render: function () {
		return E('div', { 'class': 'cbi-map' }, [
			E('iframe', {
				'src': L.resource('monowordtest/index.html'),
				'title': 'MonoWordTest',
				'style': 'width:100%;height:80vh;min-height:520px;border:0;'
			})
		]);
	}
});
