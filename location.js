class LocationManager {
    constructor() {
        this.locationButton = document.querySelector('.location-button');
        this.locationText = document.querySelector('.location-text');
        
        this.init();
    }

    init() {
        this.locationButton.addEventListener('click', () => this.requestLocation());
        
        // 尝试获取保存的位置
        const savedLocation = this.getSavedLocation();
        if (savedLocation) {
            this.updateLocation(savedLocation.latitude, savedLocation.longitude);
        } else {
            this.requestLocation();
        }

        // 监听语言变化
        window.addEventListener('languagechange', () => this.updateLocationText());
    }

    async requestLocation() {
        // 设置数据键，用于翻译
        this.locationText.dataset.key = 'gettingLocation';
        // 使用翻译函数更新文本
        this.locationText.textContent = Utils.translate('gettingLocation');
        
        try {
            const position = await this.getCurrentPosition();
            const { latitude, longitude } = position.coords;
            
            this.updateLocation(latitude, longitude);
            this.saveLocation(latitude, longitude);
            
            // 获取地理编码信息
            const locationName = await this.getLocationName(latitude, longitude);
            // 清除数据键，因为地理编码返回的是实际地名
            delete this.locationText.dataset.key;
            this.locationText.textContent = locationName;
            
        } catch (error) {
            console.error('获取位置失败:', error);
            // 设置错误消息的数据键
            this.locationText.dataset.key = 'locationError';
            this.locationText.textContent = Utils.translate('locationError');
        }
    }

    updateLocationText() {
        // 如果有数据键，说明是需要翻译的文本
        if (this.locationText.dataset.key) {
            this.locationText.textContent = Utils.translate(this.locationText.dataset.key);
        }
        // 如果没有数据键，说明是实际地名，不需要翻译
    }

    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('设备不支持地理定位'));
                return;
            }
            
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            });
        });
    }

    async getLocationName(latitude, longitude) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await response.json();
            
            // 提取城市名称
            const city = data.address.city || 
                        data.address.town || 
                        data.address.village || 
                        data.address.county;
                        
            return city;
        } catch (error) {
            console.error('获取地理编码失败:', error);
            return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        }
    }

    saveLocation(latitude, longitude) {
        localStorage.setItem('savedLocation', JSON.stringify({ latitude, longitude }));
    }

    getSavedLocation() {
        const saved = localStorage.getItem('savedLocation');
        return saved ? JSON.parse(saved) : null;
    }

    updateLocation(latitude, longitude) {
        // 触发位置更新事件
        const event = new CustomEvent('locationupdate', {
            detail: { latitude, longitude }
        });
        window.dispatchEvent(event);
    }
} 