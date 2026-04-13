// Centralized i18n translation module
// System language is stored in localStorage as 'systemLang' (values: 'en', 'cn', 'kr', 'jp')

export type SystemLang = 'en' | 'cn' | 'kr' | 'jp';

const translations: Record<string, Record<SystemLang, string>> = {
  // ── Login Page ──
  'login.title': {
    en: 'AI for video call demo',
    cn: 'AI视频通话演示',
    kr: 'AI 영상통화 데모',
    jp: 'AIビデオ通話デモ',
  },
  'login.subtitle': {
    en: 'Make every second count.',
    cn: '让每一秒都有意义。',
    kr: '매 순간을 소중하게.',
    jp: '一秒一秒を大切に。',
  },
  'login.email': {
    en: 'Email',
    cn: '邮箱',
    kr: '이메일',
    jp: 'メールアドレス',
  },
  'login.password': {
    en: 'Password',
    cn: '密码',
    kr: '비밀번호',
    jp: 'パスワード',
  },
  'login.button': {
    en: 'Log In',
    cn: '登录',
    kr: '로그인',
    jp: 'ログイン',
  },
  'login.createAccount': {
    en: 'Create account',
    cn: '创建账号',
    kr: '계정 만들기',
    jp: 'アカウント作成',
  },
  'login.forgotPassword': {
    en: 'Forgot password?',
    cn: '忘记密码？',
    kr: '비밀번호를 잊으셨나요?',
    jp: 'パスワードをお忘れですか？',
  },
  'login.validationRequired': {
    en: 'Please enter email and password',
    cn: '请输入邮箱和密码',
    kr: '이메일과 비밀번호를 입력해 주세요',
    jp: 'メールアドレスとパスワードを入力してください',
  },
  'login.invalidCredentials': {
    en: 'Invalid email or password',
    cn: '邮箱或密码错误',
    kr: '이메일 또는 비밀번호가 올바르지 않습니다',
    jp: 'メールアドレスまたはパスワードが正しくありません',
  },
  'login.loginFailed': {
    en: 'Login failed',
    cn: '登录失败',
    kr: '로그인에 실패했습니다',
    jp: 'ログインに失敗しました',
  },
  'login.socialHint': {
    en: 'Or continue with',
    cn: '或通过以下方式继续',
    kr: '또는 다른 방법으로 로그인',
    jp: 'または以下で続ける',
  },
  'login.googleButton': {
    en: 'Continue with Google',
    cn: '使用 Google 登录',
    kr: 'Google로 계속하기',
    jp: 'Google で続ける',
  },
  'login.oauthMissingClientId': {
    en: 'Google OAuth is not configured yet',
    cn: 'Google OAuth 尚未配置',
    kr: 'Google OAuth가 아직 설정되지 않았습니다',
    jp: 'Google OAuth が未設定です',
  },
  'login.oauthStateMismatch': {
    en: 'Login verification failed. Please try again.',
    cn: '登录校验失败，请重试',
    kr: '로그인 검증에 실패했습니다. 다시 시도해 주세요.',
    jp: 'ログイン検証に失敗しました。もう一度お試しください。',
  },
  'login.oauthDenied': {
    en: 'Google login was cancelled',
    cn: '你已取消 Google 登录',
    kr: 'Google 로그인이 취소되었습니다',
    jp: 'Google ログインがキャンセルされました',
  },
  'login.oauthFailed': {
    en: 'Google login failed',
    cn: 'Google 登录失败',
    kr: 'Google 로그인에 실패했습니다',
    jp: 'Google ログインに失敗しました',
  },
  'register.title': {
    en: 'Create Account',
    cn: '创建账号',
    kr: '계정 만들기',
    jp: 'アカウント作成',
  },
  'register.subtitle': {
    en: 'Sign up with email and password',
    cn: '使用邮箱和密码注册',
    kr: '이메일과 비밀번호로 가입',
    jp: 'メールとパスワードで登録',
  },
  'register.username': {
    en: 'Username',
    cn: '用户名',
    kr: '사용자 이름',
    jp: 'ユーザー名',
  },
  'register.button': {
    en: 'Create Account',
    cn: '创建账号',
    kr: '계정 만들기',
    jp: 'アカウント作成',
  },
  'register.validationRequired': {
    en: 'Please fill in all fields',
    cn: '请填写所有字段',
    kr: '모든 항목을 입력해 주세요',
    jp: 'すべての項目を入力してください',
  },
  'register.passwordTooShort': {
    en: 'Password must be at least 8 characters',
    cn: '密码至少 8 位',
    kr: '비밀번호는 8자 이상이어야 합니다',
    jp: 'パスワードは8文字以上必要です',
  },
  'register.success': {
    en: 'Account created successfully',
    cn: '账号创建成功',
    kr: '계정이 생성되었습니다',
    jp: 'アカウントを作成しました',
  },
  'register.failed': {
    en: 'Failed to create account',
    cn: '创建账号失败',
    kr: '계정 생성에 실패했습니다',
    jp: 'アカウントの作成に失敗しました',
  },
  'forgot.title': {
    en: 'Reset Password',
    cn: '重置密码',
    kr: '비밀번호 재설정',
    jp: 'パスワード再設定',
  },
  'forgot.subtitle': {
    en: 'Request a reset token and set a new password',
    cn: '申请重置令牌并设置新密码',
    kr: '재설정 토큰을 받아 새 비밀번호를 설정하세요',
    jp: 'リセットトークンを取得して新しいパスワードを設定',
  },
  'forgot.requestButton': {
    en: 'Send Reset Request',
    cn: '发送重置请求',
    kr: '재설정 요청 보내기',
    jp: 'リセットリクエストを送信',
  },
  'forgot.tokenPlaceholder': {
    en: 'Reset token',
    cn: '重置令牌',
    kr: '재설정 토큰',
    jp: 'リセットトークン',
  },
  'forgot.newPassword': {
    en: 'New password',
    cn: '新密码',
    kr: '새 비밀번호',
    jp: '新しいパスワード',
  },
  'forgot.resetButton': {
    en: 'Reset Password',
    cn: '重置密码',
    kr: '비밀번호 재설정',
    jp: 'パスワードをリセット',
  },
  'forgot.validationEmail': {
    en: 'Please enter your email',
    cn: '请输入邮箱',
    kr: '이메일을 입력해 주세요',
    jp: 'メールアドレスを入力してください',
  },
  'forgot.validationAll': {
    en: 'Please fill in all fields',
    cn: '请填写所有字段',
    kr: '모든 항목을 입력해 주세요',
    jp: 'すべての項目を入力してください',
  },
  'forgot.requestSent': {
    en: 'If the email exists, reset instructions are generated',
    cn: '如果邮箱存在，已生成重置说明',
    kr: '이메일이 존재하면 재설정 안내가 생성됩니다',
    jp: 'メールが存在する場合、リセット情報を生成しました',
  },
  'forgot.tokenGenerated': {
    en: 'Reset token (dev only)',
    cn: '重置令牌（仅开发环境）',
    kr: '재설정 토큰(개발 환경 전용)',
    jp: 'リセットトークン（開発環境のみ）',
  },
  'forgot.requestFailed': {
    en: 'Failed to request password reset',
    cn: '请求重置密码失败',
    kr: '비밀번호 재설정 요청에 실패했습니다',
    jp: 'パスワードリセットのリクエストに失敗しました',
  },
  'forgot.resetSuccess': {
    en: 'Password reset successfully',
    cn: '密码重置成功',
    kr: '비밀번호가 재설정되었습니다',
    jp: 'パスワードをリセットしました',
  },
  'forgot.resetFailed': {
    en: 'Failed to reset password',
    cn: '重置密码失败',
    kr: '비밀번호 재설정에 실패했습니다',
    jp: 'パスワードのリセットに失敗しました',
  },
  'profile.title': {
    en: 'Profile',
    cn: '个人资料',
    kr: '프로필',
    jp: 'プロフィール',
  },
  'profile.subtitle': {
    en: 'Manage your account information',
    cn: '管理你的账号信息',
    kr: '계정 정보를 관리하세요',
    jp: 'アカウント情報を管理',
  },
  'profile.back': {
    en: 'Back',
    cn: '返回',
    kr: '뒤로',
    jp: '戻る',
  },
  'profile.email': {
    en: 'Email',
    cn: '邮箱',
    kr: '이메일',
    jp: 'メール',
  },
  'profile.provider': {
    en: 'Sign-in Method',
    cn: '登录方式',
    kr: '로그인 방식',
    jp: 'ログイン方法',
  },
  'profile.username': {
    en: 'Username',
    cn: '用户名',
    kr: '사용자 이름',
    jp: 'ユーザー名',
  },
  'profile.save': {
    en: 'Save Profile',
    cn: '保存资料',
    kr: '프로필 저장',
    jp: 'プロフィールを保存',
  },
  'profile.logOut': {
    en: 'Log Out',
    cn: '退出登录',
    kr: '로그아웃',
    jp: 'ログアウト',
  },
  'profile.validationRequired': {
    en: 'Username is required',
    cn: '请输入用户名',
    kr: '사용자 이름을 입력해 주세요',
    jp: 'ユーザー名を入力してください',
  },
  'profile.updateSuccess': {
    en: 'Profile updated',
    cn: '资料已更新',
    kr: '프로필이 업데이트되었습니다',
    jp: 'プロフィールを更新しました',
  },
  'profile.updateFailed': {
    en: 'Failed to update profile',
    cn: '更新资料失败',
    kr: '프로필 업데이트에 실패했습니다',
    jp: 'プロフィールの更新に失敗しました',
  },
  'profile.loadFailed': {
    en: 'Failed to load profile',
    cn: '加载资料失败',
    kr: '프로필 로드에 실패했습니다',
    jp: 'プロフィールの読み込みに失敗しました',
  },

  // ── Language Names ──
  'lang.cn': {
    en: 'Chinese',
    cn: '中文',
    kr: '중국어',
    jp: '中国語',
  },
  'lang.kr': {
    en: 'Korean',
    cn: '韩语',
    kr: '한국어',
    jp: '韓国語',
  },
  'lang.en': {
    en: 'English',
    cn: '英语',
    kr: '영어',
    jp: '英語',
  },
  'lang.jp': {
    en: 'Japanese',
    cn: '日语',
    kr: '일본어',
    jp: '日本語',
  },

  // ── Language Select Page ──
  'langSelect.title': {
    en: 'Choose Translation',
    cn: '选择翻译',
    kr: '번역 선택',
    jp: '翻訳を選択',
  },
  'langSelect.subtitle': {
    en: 'Select your source and target language',
    cn: '选择源语言和目标语言',
    kr: '원본 언어와 대상 언어를 선택하세요',
    jp: '翻訳元と翻訳先の言語を選択',
  },
  'langSelect.from': {
    en: 'From',
    cn: '从',
    kr: '원본',
    jp: '翻訳元',
  },
  'langSelect.to': {
    en: 'To',
    cn: '至',
    kr: '대상',
    jp: '翻訳先',
  },
  'langSelect.continue': {
    en: 'Continue',
    cn: '继续',
    kr: '계속',
    jp: '続ける',
  },

  // ── Setup Pages ──
  'setup.title': {
    en: 'Create New Chat',
    cn: '创建新聊天',
    kr: '새 채팅 만들기',
    jp: '新しいチャットを作成',
  },
  'setup.chatName': {
    en: 'Chat Name',
    cn: '聊天名称',
    kr: '채팅 이름',
    jp: 'チャット名',
  },
  'setup.chatNamePlaceholder': {
    en: 'Enter a chat name...',
    cn: '输入聊天名称...',
    kr: '채팅 이름을 입력하세요...',
    jp: 'チャット名を入力...',
  },
  'setup.startChat': {
    en: 'Start Chat',
    cn: '开始聊天',
    kr: '채팅 시작',
    jp: 'チャットを始める',
  },

  // ── Chat Pages ──
  'chat.savedChats': {
    en: 'Saved Chats',
    cn: '已保存的聊天',
    kr: '저장된 채팅',
    jp: '保存済みチャット',
  },
  'chat.noChats': {
    en: 'No saved chats yet',
    cn: '暂无保存的聊天',
    kr: '저장된 채팅이 없습니다',
    jp: 'まだ保存されたチャットはありません',
  },
  'chat.newChat': {
    en: 'New Chat',
    cn: '新建聊天',
    kr: '새 채팅',
    jp: '新しいチャット',
  },
  'chat.logOut': {
    en: 'Log Out',
    cn: '退出登录',
    kr: '로그아웃',
    jp: 'ログアウト',
  },
  'chat.translating': {
    en: 'Translating...',
    cn: '翻译中...',
    kr: '번역 중...',
    jp: '翻訳中...',
  },
  'chat.typeIn': {
    en: 'Type in',
    cn: '输入',
    kr: '입력하세요',
    jp: '入力',
  },
  'chat.emptyHint': {
    en: 'Type a message in {source} to start translating to {target}...',
    cn: '输入{source}来翻译成{target}...',
    kr: '{source}를 입력하면 {target}로 번역됩니다...',
    jp: '{source}でメッセージを入力して{target}に翻訳...',
  },
  'chat.copied': {
    en: 'Copied to clipboard!',
    cn: '已复制到剪贴板！',
    kr: '클립보드에 복사됨!',
    jp: 'クリップボードにコピーしました！',
  },
  'chat.copyFailed': {
    en: 'Failed to copy',
    cn: '复制失败',
    kr: '복사 실패',
    jp: 'コピーに失敗しました',
  },
  'chat.ttsError': {
    en: 'Failed to play audio',
    cn: '语音播放失败',
    kr: '오디오 재생에 실패했습니다',
    jp: '音声の再生に失敗しました',
  },
  'chat.apiError': {
    en: 'API Error: ',
    cn: 'API 错误：',
    kr: 'API 오류: ',
    jp: 'APIエラー：',
  },
  'chat.unexpectedResponse': {
    en: 'Unexpected API response',
    cn: '意外的API响应',
    kr: '예상치 못한 API 응답',
    jp: '予期しないAPIレスポンス',
  },
  'chat.translationFailed': {
    en: 'Translation failed. Is the backend server running?',
    cn: '翻译失败。后端服务器是否正在运行？',
    kr: '번역 실패. 백엔드 서버가 실행 중인가요?',
    jp: '翻訳に失敗しました。バックエンドサーバーは起動していますか？',
  },
  'chat.systemSettings': {
    en: 'Settings',
    cn: '设置',
    kr: '설정',
    jp: '設定',
  },
  'chat.collection': {
    en: 'Collection',
    cn: '收藏',
    kr: '컬렉션',
    jp: 'コレクション',
  },
  'chat.noCollections': {
    en: 'No collections yet',
    cn: '暂无收藏',
    kr: '아직 컬렉션이 없습니다',
    jp: 'コレクションはまだありません',
  },
  'chat.collected': {
    en: 'Collected!',
    cn: '已收藏！',
    kr: '수집되었습니다!',
    jp: 'コレクションに追加しました！',
  },
  'chat.uncollected': {
    en: 'Removed from collection',
    cn: '已取消收藏',
    kr: '컬렉션에서 제거되었습니다',
    jp: 'コレクションから削除しました',
  },

  // ── Settings Pages ──
  'settings.back': {
    en: 'Back',
    cn: '返回',
    kr: '뒤로',
    jp: '戻る',
  },
  'settings.title': {
    en: 'Chat Settings',
    cn: '聊天设置',
    kr: '채팅 설정',
    jp: 'チャット設定',
  },
  'settings.background': {
    en: 'Set Background Image',
    cn: '设置背景图片',
    kr: '배경 이미지 설정',
    jp: '背景画像を設定',
  },
  'settings.tapToUpload': {
    en: 'Tap to upload',
    cn: '点击上传',
    kr: '탭하여 업로드',
    jp: 'タップしてアップロード',
  },
  'settings.save': {
    en: 'Save Changes',
    cn: '保存更改',
    kr: '변경사항 저장',
    jp: '変更を保存',
  },
  'settings.voice': {
    en: 'Voice Model',
    cn: '语音模型',
    kr: '음성 모델',
    jp: '音声モデル',
  },
  'settings.voiceDefault': {
    en: 'Default (auto by tone)',
    cn: '默认（根据语气自动选择）',
    kr: '기본값 (어조에 따라 자동)',
    jp: 'デフォルト（トーンに応じて自動）',
  },
  'settings.chatName': {
    en: 'Chat Name',
    cn: '聊天名称',
    kr: '채팅 이름',
    jp: 'チャット名',
  },
  'setup.required': {
    en: '* Required',
    cn: '* 必填',
    kr: '* 필수',
    jp: '* 必須',
  },

  // ── Tone Settings (KR) ──
  'tone.kr.casual': {
    en: 'Non-honorific',
    cn: '平语',
    kr: '반말',
    jp: 'パンマル（非敬語）',
  },
  'tone.kr.polite': {
    en: 'Honorific',
    cn: '敬语',
    kr: '존댓말',
    jp: 'チョンデンマル（敬語）',
  },
  'tone.kr.vibe.aegyo': {
    en: 'Cute & Sweet',
    cn: '可爱甜蜜',
    kr: '애교',
    jp: 'かわいい＆スイート',
  },
  'tone.kr.vibe.flirty': {
    en: 'Flirty',
    cn: '调皮撩人',
    kr: '플러팅',
    jp: 'フリーティー',
  },
  'tone.kr.vibe.jujeop': {
    en: 'Hype Mode',
    cn: '嗨起来',
    kr: '주접 모드',
    jp: 'ハイテンション',
  },
  'tone.kr.vibe.rush': {
    en: 'Quick & Short',
    cn: '简短快速',
    kr: '빠르게',
    jp: '短く簡潔に',
  },

  // ── Tone Settings (EN) ──
  'tone.en.informal': {
    en: 'Informal',
    cn: '非正式',
    kr: '비공식',
    jp: 'インフォーマル',
  },
  'tone.en.formal': {
    en: 'Formal',
    cn: '正式',
    kr: '공식',
    jp: 'フォーマル',
  },
  'tone.en.vibe.friendly': {
    en: 'Friendly',
    cn: '友好',
    kr: '친근한',
    jp: 'フレンドリー',
  },
  'tone.en.vibe.professional': {
    en: 'Professional',
    cn: '专业',
    kr: '전문적',
    jp: 'プロフェッショナル',
  },
  'tone.en.vibe.witty': {
    en: 'Witty',
    cn: '机智',
    kr: '재치있는',
    jp: 'ウィッティー',
  },
  'tone.en.vibe.concise': {
    en: 'Concise',
    cn: '简洁',
    kr: '간결한',
    jp: '簡潔',
  },

  // ── Tone Settings (JP) ──
  'tone.jp.casual': {
    en: 'Casual (タメ口)',
    cn: '日常（タメ口）',
    kr: '반말 (タメ口)',
    jp: 'タメ口',
  },
  'tone.jp.polite': {
    en: 'Polite (敬語)',
    cn: '礼貌（敬語）',
    kr: '존댓말 (敬語)',
    jp: '敬語',
  },
  'tone.jp.vibe.kawaii': {
    en: 'Cute (かわいい)',
    cn: '可爱（かわいい）',
    kr: '귀여운 (かわいい)',
    jp: 'かわいい',
  },
  'tone.jp.vibe.otaku': {
    en: 'Otaku',
    cn: '御宅族',
    kr: '오타쿠',
    jp: 'オタク',
  },
  'tone.jp.vibe.business': {
    en: 'Business',
    cn: '商务',
    kr: '비즈니스',
    jp: 'ビジネス',
  },
  'tone.jp.vibe.concise': {
    en: 'Concise',
    cn: '简洁',
    kr: '간결한',
    jp: '簡潔',
  },

  // ── Shared Tone / Vibes (风格) ──
  'tone.vibe.cute': {
    en: 'Cutesy',
    cn: '可爱',
    kr: '귀여운',
    jp: 'かわいい',
  },
  'tone.vibe.playful': {
    en: 'Playful',
    cn: '调皮',
    kr: '장난스러운',
    jp: 'いたずら',
  },
  'tone.vibe.coquettish': {
    en: 'Coquettish',
    cn: '撒娇',
    kr: '애교',
    jp: '甘え',
  },
  'tone.vibe.natural': {
    en: 'Natural',
    cn: '自然',
    kr: '자연스러운',
    jp: '自然',
  },
  'tone.vibe.concise': {
    en: 'Concise',
    cn: '简短',
    kr: '간결한',
    jp: '簡潔',
  },
  'tone.vibe.formal': {
    en: 'Formal',
    cn: '正式',
    kr: '공식',
    jp: 'フォーマル',
  },
  'tone.vibes': {
    en: 'Vibes:',
    cn: '风格：',
    kr: '분위기:',
    jp: 'バイブス：',
  },
  'tone.persona': {
    en: 'Fine-tune Persona:',
    cn: '自定义角色：',
    kr: '페르소나 세부 조정:',
    jp: 'ペルソナの微調整：',
  },
  'tone.personaPlaceholder': {
    en: 'Describe your custom persona, tone, or style...',
    cn: '描述你的自定义角色、语调或风格...',
    kr: '맞춤 페르소나, 톤 또는 스타일을 설명하세요...',
    jp: 'カスタムペルソナ、トーン、スタイルを説明...',
  },

  // ── Flashcard Page ──
  'flashcard.saved': {
    en: 'Saved to downloads!',
    cn: '已保存到下载！',
    kr: '다운로드에 저장됨!',
    jp: 'ダウンロードに保存しました！',
  },
  'flashcard.saveFailed': {
    en: 'Failed to save image',
    cn: '保存图片失败',
    kr: '이미지 저장 실패',
    jp: '画像の保存に失敗しました',
  },
  'flashcard.hint': {
    en: 'Tap the download icon to save this flashcard',
    cn: '点击下载图标保存此卡片',
    kr: '다운로드 아이콘을 탭하여 플래시카드 저장',
    jp: 'ダウンロードアイコンをタップしてフラッシュカードを保存',
  },

  // ── System Settings Page ──
  'sysSettings.title': {
    en: 'Settings',
    cn: '设置',
    kr: '설정',
    jp: '設定',
  },
  'sysSettings.langTitle': {
    en: 'Interface Language',
    cn: '界面语言',
    kr: '인터페이스 언어',
    jp: 'インターフェース言語',
  },
  'sysSettings.langDesc': {
    en: 'Choose the language for app interface',
    cn: '选择应用界面语言',
    kr: '앱 인터페이스 언어를 선택하세요',
    jp: 'アプリのインターフェース言語を選択',
  },
  'sysSettings.back': {
    en: 'Back',
    cn: '返回',
    kr: '뒤로',
    jp: '戻る',
  },
  'sysSettings.logOut': {
    en: 'Log Out',
    cn: '退出登录',
    kr: '로그아웃',
    jp: 'ログアウト',
  },

};

/** Get the current system language from localStorage, default to 'cn' */
export function getSystemLang(): SystemLang {
  const lang = localStorage.getItem('systemLang');
  if (lang === 'cn' || lang === 'kr' || lang === 'jp' || lang === 'en') return lang;
  return 'cn';
}

/** Set system language */
export function setSystemLang(lang: SystemLang) {
  localStorage.setItem('systemLang', lang);
}

/** Translate a key to the current system language */
export function t(key: string, replacements?: Record<string, string>): string {
  const lang = getSystemLang();
  const entry = translations[key];
  if (!entry) return key;
  let text = entry[lang] || entry['en'] || key;
  if (replacements) {
    for (const [k, v] of Object.entries(replacements)) {
      text = text.replace(`{${k}}`, v);
    }
  }
  return text;
}

/** Get a translated language label by its code (cn/kr/en/jp) */
export function langLabel(code: string): string {
  return t('lang.' + code);
}
