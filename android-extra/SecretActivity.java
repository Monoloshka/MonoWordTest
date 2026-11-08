package io.github.monowordtest;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;

/**
 * A hidden Activity: it has no launcher entry and nothing in the app opens it, but it is exported,
 * so an activity launcher app (for example "Activity Launcher") can start it directly.
 * It shows the secret word of the day from the built-in dictionary.
 */
public class SecretActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WebView web = new WebView(this);
        web.getSettings().setJavaScriptEnabled(true);
        setContentView(web);
        web.loadUrl("file:///android_asset/public/secret.html");
    }
}
