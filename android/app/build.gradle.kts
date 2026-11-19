import java.util.Properties

plugins {
    id("com.android.application")
}

// 웹 앱 주소. 바꾸면 res/values/strings.xml 의 launch_url·asset_statements 와
// 웹 서버의 /.well-known/assetlinks.json 도 같이 바꾼다.
val webHost = "deardays.https.gsmsv.site"

// 서명 키: 저장소에 올리지 않도록 저장소 밖 폴더에 둔다.
// 기본 위치는 deardays 폴더 옆의 deardays-android-signing/keystore.properties
// 다른 곳에 두었다면 ./gradlew assembleRelease -Pdeardays.signing=경로 로 알려 준다.
val signingFile = (findProperty("deardays.signing") as String?)?.let { file(it) }
    ?: rootProject.file("../../deardays-android-signing/keystore.properties")
val signing = Properties().apply {
    if (signingFile.exists()) signingFile.inputStream().use { load(it) }
}

android {
    namespace = "site.gsmsv.deardays"
    compileSdk = 36

    defaultConfig {
        applicationId = "site.gsmsv.deardays"
        minSdk = 24
        targetSdk = 36
        // 새 APK 를 낼 때마다 versionCode 를 1씩 올린다 (같거나 작으면 업데이트 설치가 안 된다)
        versionCode = 1
        versionName = "1.0.0"
        manifestPlaceholders["hostName"] = webHost
    }

    signingConfigs {
        create("release") {
            if (!signing.isEmpty) {
                storeFile = file(signing.getProperty("storeFile"))
                storePassword = signing.getProperty("storePassword")
                keyAlias = signing.getProperty("keyAlias")
                keyPassword = signing.getProperty("keyPassword")
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = if (signing.isEmpty) null else signingConfigs.getByName("release")
        }
    }
}

dependencies {
    // Trusted Web Activity: 크롬으로 웹 앱을 주소창 없이 전체 화면으로 연다 (웹 푸시 알림도 그대로)
    implementation("com.google.androidbrowserhelper:androidbrowserhelper:2.7.4")
}
