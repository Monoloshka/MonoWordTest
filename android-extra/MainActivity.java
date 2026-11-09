package io.github.monowordtest;

import android.os.Bundle;
import android.webkit.JavascriptInterface;
import com.getcapacitor.BridgeActivity;

/**
 * Capacitor's activity plus one tiny JavaScript bridge, window.MWTAndroid.exit(), used by the page's
 * "Exit" button: a web page cannot close an Android app by itself.
 */
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            getBridge().getWebView().addJavascriptInterface(new ExitBridge(), "MWTAndroid");
        } catch (Exception ignored) {
            // the page then falls back to the Capacitor App plugin
        }
    }

    private class ExitBridge {
        @JavascriptInterface
        public void exit() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    finishAndRemoveTask();
                }
            });
        }
    }
}
