package io.github.monowordtest;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/** Hidden activity opened explicitly by Android activity-launcher tools. */
public class SecretActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        AppProcess.created();
        WebView web = new WebView(this);
        web.getSettings().setJavaScriptEnabled(false);
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return handle(request.getUrl());
            }

            @Override
            @SuppressWarnings("deprecation")
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return handle(Uri.parse(url));
            }
        });
        setContentView(web);
        web.loadUrl("file:///android_asset/public/secret.html");
    }

    /** tg:// links go to Telegram; if Telegram is not installed nothing happens. Other links are ignored. */
    private boolean handle(Uri uri) {
        if (uri != null && "tg".equalsIgnoreCase(uri.getScheme())) {
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, uri));
            } catch (ActivityNotFoundException ignored) {
                // Telegram is not installed: do nothing
            } catch (RuntimeException ignored) {
                // never crash because of a link
            }
            return true;
        }
        return !"file".equalsIgnoreCase(uri == null ? null : uri.getScheme());
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        AppProcess.destroyed(this);
    }
}
