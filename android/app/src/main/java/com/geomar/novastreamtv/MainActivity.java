package com.geomar.novastreamtv;

import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebView;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;
import com.getcapacitor.BridgeWebChromeClient;
import java.io.ByteArrayInputStream;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

public class MainActivity extends BridgeActivity {

    // Lista negra de dominios de publicidad
    private static final Set<String> AD_DOMAINS = new HashSet<>(Arrays.asList(
        "doubleclick.net", "googlesyndication.com", "googleadservices.com",
        "adservice.google.com", "pagead2.googlesyndication.com",
        "popads.net", "popcash.net", "propellerads.com",
        "adsterra.com", "exoclick.com", "trafficjunky.com", "juicyads.com",
        "clickadu.com", "hilltopads.net", "richpush.com", "adcash.com",
        "admaven.com", "evadav.com", "monetag.com", "onclicka.com",
        "tsyndicate.com", "a-ads.com", "ad-maven.com",
        "popunder.net", "popmyads.com", "clickaine.com",
        "mgid.com", "taboola.com", "outbrain.com", "zergnet.com",
        "revenuehits.com", "bidvertiser.com", "yllix.com",
        "pushground.com", "notix.io", "setupad.com",
        "pushnotificationapi.com", "vooservers.com"
    ));

    private static boolean isAdDomain(String url) {
        if (url == null) return false;
        String lower = url.toLowerCase();
        for (String domain : AD_DOMAINS) {
            if (lower.contains(domain)) return true;
        }
        // Bloquear patrones comunes de ads
        if (lower.matches(".*/(ads?|banner|popup|popunder|click|tracker?)/.*")) return true;
        return false;
    }

    // Respuesta vacía para peticiones bloqueadas
    private static final WebResourceResponse EMPTY_RESPONSE = 
        new WebResourceResponse("text/plain", "utf-8", new ByteArrayInputStream("".getBytes()));

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

            // Personalizar WebChromeClient para descartar popups completamente
            webView.setWebChromeClient(new BridgeWebChromeClient(getBridge()) {
                @Override
                public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, android.os.Message resultMsg) {
                    android.util.Log.d("NovaStreamTV", "Popup/Nueva ventana anulada completamente");
                    if (resultMsg != null) {
                        try {
                            WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
                            if (transport != null) {
                                WebView dummyWebView = new WebView(view.getContext());
                                transport.setWebView(dummyWebView);
                                resultMsg.sendToTarget();
                            }
                        } catch (Exception e) {
                            android.util.Log.e("NovaStreamTV", "Error al anular popup transport", e);
                        }
                    }
                    return true; // Devuelve true tras consumir el transporte
                }
            });

            // Personalizar WebViewClient con bloqueo de ads a nivel de red
            webView.setWebViewClient(new BridgeWebViewClient(getBridge()) {
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    String url = request.getUrl().toString();
                    // Bloquear navegación a dominios de ads
                    if (isAdDomain(url)) {
                        android.util.Log.d("NovaStreamTV", "Navegación a ad bloqueada: " + url);
                        return true;
                    }
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

                @Override
                public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                    String url = request.getUrl().toString();
                    // Bloquear peticiones de red a dominios de publicidad
                    if (isAdDomain(url)) {
                        android.util.Log.d("NovaStreamTV", "Petición de ad bloqueada: " + url);
                        return EMPTY_RESPONSE;
                    }
                    return super.shouldInterceptRequest(view, request);
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
