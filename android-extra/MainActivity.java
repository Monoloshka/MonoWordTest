package io.github.monowordtest;

import android.os.Bundle;
import android.webkit.JavascriptInterface;
import com.getcapacitor.BridgeActivity;

/**
 * Capacitor's activity plus one tiny JavaScript bridge, window.MWTAndroid.exit(), used by the page's
 * "Exit" button: a web page cannot close an Android app by itself.
 * Exit removes all tasks of the app (also a SecretActivity opened earlier) and ends the process.
 */
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        AppProcess.created();
        try {
            getBridge().getWebView().addJavascriptInterface(new ExitBridge(), "MWTAndroid");
        } catch (Exception ignored) {
            // the page then falls back to the Capacitor App plugin
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        AppProcess.destroyed(this);
    }

    private class ExitBridge {
        @JavascriptInterface
        public void exit() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    AppProcess.exitAll(MainActivity.this);
                }
            });
        }
    }
}
