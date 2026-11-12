package io.github.monowordtest;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/** Hidden activity opened explicitly by Android activity-launcher tools. */
public class SecretActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WebView web = new WebView(this);
        web.getSettings().setJavaScriptEnabled(false);
        web.setWebViewClient(new WebViewClient());
        setContentView(web);
        web.loadUrl("file:///android_asset/public/secret.html");
    }
}
