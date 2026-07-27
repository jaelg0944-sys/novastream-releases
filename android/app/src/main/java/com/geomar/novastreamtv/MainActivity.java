package com.geomar.novastreamtv;

import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebView;
import android.webkit.WebResourceRequest;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;
import com.getcapacitor.BridgeWebChromeClient;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Mantener pantalla encendida durante reproducción
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        // Permitir audio en segundo plano: el WebView no se pausa al perder foco
        WebView webView = getBridge().getWebView();
        if (webView != null) {
            webView.getSettings().setMediaPlaybackRequiresUserGesture(false);

            // Bloquear la creación de ventanas emergentes (popups) de publicidad
            webView.getSettings().setSupportMultipleWindows(true);
            webView.getSettings().setJavaScriptCanOpenWindowsAutomatically(false);

            // Personalizar WebChromeClient para descartar popups
            webView.setWebChromeClient(new BridgeWebChromeClient(getBridge()) {
                @Override
                public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, android.os.Message resultMsg) {
                    android.util.Log.d("NovaStreamTV", "Popup bloqueado en WebChromeClient");
                    return false; // Retornar false previene la creación del popup
                }
            });

            // Personalizar WebViewClient para bloquear redirecciones de la app a sitios de anuncios
            webView.setWebViewClient(new BridgeWebViewClient(getBridge()) {
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    String url = request.getUrl().toString();
                    // Si se intenta navegar la ventana principal a un dominio externo no permitido
                    if (request.isForMainFrame() && 
                        !url.contains("novastreamtv-plum.vercel.app") && 
                        !url.contains("localhost") && 
                        !url.contains("127.0.0.1") &&
                        !url.startsWith("capacitor://")) {
                        android.util.Log.d("NovaStreamTV", "Redirección de ventana principal bloqueada: " + url);
                        return true; // Bloquear la navegación
                    }
                    return super.shouldOverrideUrlLoading(view, request);
                }
            });
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            enableImmersiveMode();
        }
    }

    private void enableImmersiveMode() {
        // Modo inmersivo: ocultar barra de estado y navegación
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_FULLSCREEN
        );
    }

    @Override
    public void onPause() {
        super.onPause();
    }

    @Override
    public void onResume() {
        super.onResume();
        enableImmersiveMode();
    }
}
