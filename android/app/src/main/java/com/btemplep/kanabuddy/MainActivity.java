/*
 * SPDX-FileCopyrightText: 2026 Brandon Temple Paul
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
package com.btemplep.kanabuddy;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.webkit.WebViewAssetLoader;

/**
 * Hosts the bundled KanaBuddy web app in a WebView.
 *
 * The site lives in the app's assets (copied from the repo's src/ at build
 * time) and is served over a virtual https origin by WebViewAssetLoader, so
 * relative paths, fetch, and local fonts all behave as they would on a real
 * server. No network access is required.
 */
public class MainActivity extends AppCompatActivity {

    private static final String START_URL ="https://appassets.androidplatform.net/assets/www/index.html";
    private static final String ASSET_HOST = "appassets.androidplatform.net";
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        webView = findViewById(R.id.webview);

        // targetSdk 35+ already draws edge-to-edge, so the content extends
        // behind the status/navigation bars and the web header's nav would sit
        // under the status bar (untappable). Pad the root container by the
        // system bars so the WebView (and the page) starts below them.
        //
        // Also pad by the IME (soft keyboard) inset at the bottom: with
        // adjustResize + edge-to-edge the window does not shrink on its own, so
        // consuming the IME inset here makes the WebView shrink above the
        // keyboard. That gives the page a visible viewport that excludes the
        // keyboard, so the quiz's scrollIntoView centers cells correctly (as it
        // already does in a mobile browser).
        View root = findViewById(R.id.root);
        ViewCompat.setOnApplyWindowInsetsListener(root, (v, windowInsets) -> {
            Insets bars = windowInsets.getInsets(
                WindowInsetsCompat.Type.systemBars()
                    | WindowInsetsCompat.Type.displayCutout()
            );
            Insets ime = windowInsets.getInsets(WindowInsetsCompat.Type.ime());
            int bottom = Math.max(bars.bottom, ime.bottom);
            v.setPadding(bars.left, bars.top, bars.right, bottom);

            return WindowInsetsCompat.CONSUMED;
        });

        final WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler(
                    "/assets/",
                    new WebViewAssetLoader.AssetsPathHandler(this)
                )
                .build();

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(
                WebView view,
                WebResourceRequest request
            ) {
                return assetLoader.shouldInterceptRequest(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(
                WebView view,
                WebResourceRequest request
            ) {
                Uri url = request.getUrl();
                // Keep navigation within the bundled site inside the WebView;
                // send any other (external) link out to the system browser.
                if (ASSET_HOST.equals(url.getHost())) {
                    return false;
                }
                openExternal(url);

                return true;
            }
        });
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        if (savedInstanceState == null) {
            webView.loadUrl(START_URL);
        }
        getOnBackPressedDispatcher().addCallback(
            this,
            new OnBackPressedCallback(true) {
                @Override
                public void handleOnBackPressed() {
                    if (webView.canGoBack()) {
                        webView.goBack();
                    } else {
                        setEnabled(false);
                        getOnBackPressedDispatcher().onBackPressed();
                    }
                }
            }
        );
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        webView.saveState(outState);
    }

    // Open an external link in the user's browser (or an app that handles it).
    // Launching another app via an Intent does not require INTERNET, so the
    // app itself stays offline.
    private void openExternal(Uri url) {
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, url);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(intent);
        } catch (ActivityNotFoundException ignored) {
            // No app available to open the link; nothing to do.
        }
    }

    @Override
    protected void onRestoreInstanceState(Bundle savedInstanceState) {
        super.onRestoreInstanceState(savedInstanceState);
        webView.restoreState(savedInstanceState);
    }
}
