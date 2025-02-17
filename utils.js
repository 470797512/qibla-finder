class Utils {
    // 角度转弧度
    static toRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    // 弧度转角度
    static toDegrees(radians) {
        return radians * 180 / Math.PI;
    }

    // 规范化角度到 0-360 范围
    static normalizeAngle(angle) {
        angle = angle % 360;
        return angle < 0 ? angle + 360 : angle;
    }

    // 计算两点之间的大圆距离（单位：公里）
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // 地球半径（公里）
        const φ1 = this.toRadians(lat1);
        const φ2 = this.toRadians(lat2);
        const Δφ = this.toRadians(lat2 - lat1);
        const Δλ = this.toRadians(lon2 - lon1);

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    // 日期格式化
    static formatDate(date, format = 'YYYY-MM-DD') {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes);
    }

    // 防抖函数
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 节流函数
    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // 检测设备类型
    static getDeviceType() {
        const ua = navigator.userAgent;
        if (/android/i.test(ua)) return 'android';
        if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
        return 'other';
    }

    // 检测是否支持某些特性
    static checkFeatureSupport() {
        return {
            geolocation: 'geolocation' in navigator,
            deviceOrientation: 'DeviceOrientationEvent' in window,
            localStorage: 'localStorage' in window,
            touchEvents: 'ontouchstart' in window
        };
    }

    // 错误处理和日志记录
    static handleError(error, context = '') {
        console.error(`[${context}]`, error);
        // 这里可以添加错误上报逻辑
    }

    // 语言相关
    static translations = {
        zh: {
            fajr: '晨礼拜',
            dhuhr: '晌礼拜',
            asr: '晡礼拜',
            maghrib: '昏礼拜',
            isha: '宵礼拜',
            nextPrayer: '下一次祷告',
            gettingLocation: '正在获取位置...',
            locationError: '无法获取位置',
            deviceNotSupported: '设备不支持地理定位功能',
            compassNotSupported: '设备不支持方向感应功能',
            highAccuracy: '高精度',
            mediumAccuracy: '中等精度',
            lowAccuracy: '低精度',
            qiblaDirection: '麦加方向',
            distanceToMecca: '距离麦加',
            kilometers: '公里',
            degrees: '度',
            north: '北',
            south: '南',
            east: '东',
            west: '西'
        },
        ar: {
            fajr: 'الفجر',
            dhuhr: 'الظهر',
            asr: 'العصر',
            maghrib: 'المغرب',
            isha: 'العشاء',
            nextPrayer: 'الصلاة القادمة',
            gettingLocation: 'جاري تحديد الموقع...',
            locationError: 'تعذر تحديد الموقع',
            deviceNotSupported: 'الجهاز لا يدعم تحديد المواقع',
            compassNotSupported: 'الجهاز لا يدعم استشعار الاتجاه',
            highAccuracy: 'دقة عالية',
            mediumAccuracy: 'دقة متوسطة',
            lowAccuracy: 'دقة منخفضة',
            qiblaDirection: 'اتجاه القبلة',
            distanceToMecca: 'المسافة إلى مكة',
            kilometers: 'كم',
            degrees: 'درجة',
            north: 'شمال',
            south: 'جنوب',
            east: 'شرق',
            west: 'غرب'
        },
        en: {
            fajr: 'Fajr',
            dhuhr: 'Dhuhr',
            asr: 'Asr',
            maghrib: 'Maghrib',
            isha: 'Isha',
            nextPrayer: 'Next Prayer',
            gettingLocation: 'Getting location...',
            locationError: 'Location unavailable',
            deviceNotSupported: 'Device does not support geolocation',
            compassNotSupported: 'Device does not support orientation',
            highAccuracy: 'High Accuracy',
            mediumAccuracy: 'Medium Accuracy',
            lowAccuracy: 'Low Accuracy',
            qiblaDirection: 'Qibla Direction',
            distanceToMecca: 'Distance to Mecca',
            kilometers: 'km',
            degrees: 'deg',
            north: 'N',
            south: 'S',
            east: 'E',
            west: 'W'
        }
    };

    static currentLang = 'zh'; // 默认语言

    static translate(key) {
        return this.translations[this.currentLang][key] || key;
    }

    static setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            // 触发语言更改事件
            window.dispatchEvent(new CustomEvent('languagechange'));
        }
    }

    // 获取文字方向
    static getTextDirection() {
        return this.currentLang === 'ar' ? 'rtl' : 'ltr';
    }
} 