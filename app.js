class QiblaApp {
    constructor() {
        // 初始化各个组件
        this.compass = new CompassController();
        this.prayerTimes = new PrayerTimesCalculator();
        this.locationManager = new LocationManager();
        
        // 初始化主题
        this.initTheme();
        
        // 初始化语言
        this.initLanguage();
        
        // 绑定事件监听
        this.bindEvents();
        
        // 检查设备支持
        this.checkDeviceSupport();
        
        // 检测并设置平台
        this.detectPlatform();
    }

    initTheme() {
        // 检测系统主题
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        this.updateTheme(prefersDark.matches);
        
        // 监听系统主题变化
        prefersDark.addEventListener('change', (e) => this.updateTheme(e.matches));
    }

    updateTheme(isDark) {
        document.body.classList.toggle('dark-theme', isDark);
    }

    initLanguage() {
        // 获取浏览器语言
        const browserLang = navigator.language.split('-')[0];
        if (Utils.translations[browserLang]) {
            Utils.setLanguage(browserLang);
        }

        // 绑定语言切换按钮
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.dataset.lang;
                Utils.setLanguage(lang);
                this.updateLanguageUI();
                this.updateDirection();
            });
        });

        // 初始更新UI
        this.updateLanguageUI();
    }

    updateLanguageUI() {
        // 更新语言按钮状态
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === Utils.currentLang);
        });

        // 更新文字方向
        document.documentElement.dir = Utils.getTextDirection();

        // 更新所有翻译文本
        this.updateTranslations();
    }

    updateTranslations() {
        // 更新祷告时间标题
        document.querySelector('.next-prayer h2').textContent = Utils.translate('nextPrayer');

        // 更新位置文本
        const locationText = document.querySelector('.location-text');
        if (locationText.dataset.key) {
            locationText.textContent = Utils.translate(locationText.dataset.key);
        }

        // 更新精度指示器
        const accuracyText = document.querySelector('.accuracy-text');
        if (accuracyText.dataset.key) {
            accuracyText.textContent = Utils.translate(accuracyText.dataset.key);
        }

        // 更新祷告时间列表
        this.prayerTimes.updateDisplay();
    }

    bindEvents() {
        // 监听位置更新
        window.addEventListener('locationupdate', (e) => {
            const { latitude, longitude } = e.detail;
            
            // 更新祷告时间
            this.prayerTimes.setLocation(latitude, longitude);
            
            // 计算并更新麦加方向
            const qiblaAngle = this.prayerTimes.calculateQiblaDirection(latitude, longitude);
            this.compass.setQiblaAngle(qiblaAngle);
        });

        // 监听设备方向变化
        window.addEventListener('deviceorientation', Utils.throttle((event) => {
            this.compass.handleOrientation(event);
        }, 16), true);

        // 监听错误
        window.addEventListener('error', (e) => {
            Utils.handleError(e.error, 'Global Error');
        });
    }

    checkDeviceSupport() {
        const support = Utils.checkFeatureSupport();
        
        if (!support.geolocation) {
            this.showError('您的设备不支持地理定位功能');
        }
        
        if (!support.deviceOrientation) {
            this.showError('您的设备不支持方向感应功能');
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    detectPlatform() {
        const ua = navigator.userAgent.toLowerCase();
        const isIOS = /iphone|ipad|ipod/.test(ua);
        const isAndroid = /android/.test(ua);
        
        if (isIOS) {
            document.body.classList.add('ios');
            // iOS 特定初始化
            this.initIOSSpecific();
        } else if (isAndroid) {
            document.body.classList.add('android');
            // Android 特定初始化
            this.initAndroidSpecific();
        } else {
            // 默认使用 iOS 风格
            document.body.classList.add('ios');
        }
    }

    initIOSSpecific() {
        // 添加 iOS 触感反馈
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                if ('vibrate' in navigator) {
                    navigator.vibrate(1);
                }
            });
        });

        // iOS 特定动画
        document.documentElement.style.setProperty(
            '--animation-timing', 
            'cubic-bezier(0.23, 1, 0.32, 1)'
        );
    }

    initAndroidSpecific() {
        // 添加 Android 触感反馈
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                if ('vibrate' in navigator) {
                    navigator.vibrate([0, 10, 20]);
                }
            });
        });

        // Android 特定动画
        document.documentElement.style.setProperty(
            '--animation-timing', 
            'cubic-bezier(0.4, 0, 0.2, 1)'
        );
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    window.app = new QiblaApp();
}); 