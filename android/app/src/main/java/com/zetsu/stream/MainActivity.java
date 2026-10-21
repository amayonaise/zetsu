package com.zetsu.stream;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private boolean isImmersiveFullscreen = false;

    public class AndroidBridge {
        @JavascriptInterface
        public void setFullscreen(boolean fullscreen) {
            runOnUiThread(() -> applyImmersiveMode(fullscreen));
        }

        @JavascriptInterface
        public void toggleFullscreen() {
            runOnUiThread(() -> applyImmersiveMode(!isImmersiveFullscreen));
        }

        @JavascriptInterface
        public boolean isFullscreen() {
            return isImmersiveFullscreen;
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setupEdgeToEdge();

        try {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                webView.setBackgroundColor(Color.parseColor("#030705"));
                webView.addJavascriptInterface(new AndroidBridge(), "AndroidBridge");
            }
        } catch (Exception ignored) {}
    }

    @Override
    public void onResume() {
        super.onResume();
        setupEdgeToEdge();
        if (isImmersiveFullscreen) {
            applyImmersiveMode(true);
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            setupEdgeToEdge();
            if (isImmersiveFullscreen) {
                applyImmersiveMode(true);
            }
        }
    }

    private void setupEdgeToEdge() {
        Window window = getWindow();
        if (window == null) return;

        // 1. Dark theme background on decor view & system bars
        window.getDecorView().setBackgroundColor(Color.parseColor("#030705"));
        window.setStatusBarColor(Color.parseColor("#030705"));
        window.setNavigationBarColor(Color.parseColor("#030705"));

        // 2. Allow drawing under camera notch in landscape
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            WindowManager.LayoutParams lp = window.getAttributes();
            lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            window.setAttributes(lp);
        }

        // 3. Make status bar icons light (white text on dark background)
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, window.getDecorView());
        if (controller != null) {
            controller.setAppearanceLightStatusBars(false);
            controller.setAppearanceLightNavigationBars(false);
        }
    }

    private void applyImmersiveMode(boolean enable) {
        isImmersiveFullscreen = enable;
        Window window = getWindow();
        if (window == null) return;

        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, window.getDecorView());
        if (controller != null) {
            if (enable) {
                controller.hide(WindowInsetsCompat.Type.systemBars());
                controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            } else {
                controller.show(WindowInsetsCompat.Type.systemBars());
                setupEdgeToEdge();
            }
        }
    }
}
