import com.android.build.api.variant.SourceDirectories
import org.gradle.api.DefaultTask
import org.gradle.api.file.DirectoryProperty
import org.gradle.api.file.FileSystemOperations
import org.gradle.api.tasks.InputDirectory
import org.gradle.api.tasks.OutputDirectory
import org.gradle.api.tasks.PathSensitive
import org.gradle.api.tasks.PathSensitivity
import org.gradle.api.tasks.TaskAction
import javax.inject.Inject

plugins {
    alias(libs.plugins.android.application)
}

// KanaBuddy ships the web app in ../src as the single source of truth. Read
// the version straight from src/js/version.js so the web app and the Android
// app always share one version number.
val versionFile = rootProject.file("../src/js/version.js")
val appVersionName: String = Regex("""APP_VERSION\s*=\s*"([^"]+)"""")
    .find(versionFile.readText())
    ?.groupValues?.get(1)
    ?: error("Could not read APP_VERSION from ${versionFile.path}")

// Turn a semantic version like "0.5.0" into a monotonic integer (0*10000 +
// 5*100 + 0 = 500) for Play Store versionCode. Supports up to .99 per segment.
val appVersionCode: Int = appVersionName.split(".").let { parts ->
    val major = parts.getOrNull(0)?.toIntOrNull() ?: 0
    val minor = parts.getOrNull(1)?.toIntOrNull() ?: 0
    val patch = parts.getOrNull(2)?.toIntOrNull() ?: 0
    major * 10000 + minor * 100 + patch
}

// Copies the web app (../src) into a generated directory that AGP wires in as
// an assets source directory. Using a task with a DirectoryProperty output lets
// the Variant API carry the task dependency automatically (no preBuild hack).
abstract class SyncWebAssets : DefaultTask() {

    @get:InputDirectory
    @get:PathSensitive(PathSensitivity.RELATIVE)
    abstract val webSrcDir: DirectoryProperty

    @get:OutputDirectory
    abstract val outputDir: DirectoryProperty

    @get:Inject
    abstract val fs: FileSystemOperations

    @TaskAction
    fun run() {
        // Copy into a www/ subdirectory so the files land at assets/www/ in the
        // APK, matching the URL MainActivity loads
        // (https://appassets.androidplatform.net/assets/www/index.html).
        fs.sync {
            from(webSrcDir) {
                exclude("CNAME")
                into("www")
            }
            into(outputDir)
        }
    }
}

val syncWebAssets = tasks.register<SyncWebAssets>("syncWebAssets") {
    description = "Copies the KanaBuddy web app (../src) into the APK assets."
    webSrcDir.set(layout.dir(provider { rootProject.file("../src") }))
}

androidComponents {
    onVariants { variant ->
        variant.sources.assets?.addGeneratedSourceDirectory(
            syncWebAssets,
            SyncWebAssets::outputDir
        )
    }
}

android {
    namespace = "com.btemplep.kanabuddy"
    compileSdk {
        version = release(37)
    }

    defaultConfig {
        applicationId = "com.btemplep.kanabuddy"
        minSdk = 24
        targetSdk = 37
        versionCode = appVersionCode
        versionName = appVersionName

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            optimization {
                enable = true
                packageScope = setOf("androidx.**", "kotlin.**", "kotlinx.**")
            }
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
}

dependencies {
    implementation(libs.androidx.appcompat)
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.webkit)
    implementation(libs.material)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(libs.androidx.junit)
}