// Servicio Global de Gestión y Gamificación de Logros RocketBot
import {
  ACHIEVEMENTS_DATA,
  AchievementItem,
  AchievementCategory,
  CATEGORY_METADATA,
} from '../data/achievementsData';
import { audioFeedback } from './audioFeedback';

const STORAGE_KEY = 'rocketbot_unlocked_achievements_v1';
const UNLOCKED_DATES_KEY = 'rocketbot_achievement_dates_v1';

type AchievementListener = (item: AchievementItem) => void;

class AchievementsService {
  private unlockedIds: Set<string> = new Set();
  private unlockDates: Record<string, string> = {};
  private listeners: Set<AchievementListener> = new Set();
  private itemsById: Map<string, AchievementItem> = new Map();

  constructor() {
    // Indexar por ID
    ACHIEVEMENTS_DATA.forEach((item) => {
      this.itemsById.set(item.id, item);
    });

    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.unlockedIds = new Set(parsed);
        }
      } else {
        // Logro inicial de bienvenida para todo nuevo trader
        this.unlockedIds.add('acad_01');
        this.unlockDates['acad_01'] = new Date().toISOString();
        this.saveToStorage();
      }

      const storedDates = localStorage.getItem(UNLOCKED_DATES_KEY);
      if (storedDates) {
        this.unlockDates = JSON.parse(storedDates) || {};
      }
    } catch (e) {
      console.warn('Error loading achievements from storage:', e);
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(this.unlockedIds)));
      localStorage.setItem(UNLOCKED_DATES_KEY, JSON.stringify(this.unlockDates));
    } catch (e) {
      console.warn('Error saving achievements:', e);
    }
  }

  public getUnlockedIds(): string[] {
    return Array.from(this.unlockedIds);
  }

  public isUnlocked(id: string): boolean {
    return this.unlockedIds.has(id);
  }

  public getAchievement(id: string): AchievementItem | undefined {
    return this.itemsById.get(id);
  }

  public getAll(): AchievementItem[] {
    return ACHIEVEMENTS_DATA.map((item) => ({
      ...item,
      unlockedAt: this.unlockDates[item.id] || (this.unlockedIds.has(item.id) ? new Date().toISOString() : null),
    }));
  }

  /**
   * Desbloquea un logro si aún no lo ha sido, reproduce la fanfarria y notifica a los oyentes (Toast)
   */
  public unlock(id: string, options?: { silent?: boolean }): boolean {
    if (!this.itemsById.has(id)) {
      console.warn(`[Achievements] Logro desconocido: ${id}`);
      return false;
    }

    if (this.unlockedIds.has(id)) {
      return false; // Ya estaba desbloqueado
    }

    const item = this.itemsById.get(id)!;
    const nowIso = new Date().toISOString();

    this.unlockedIds.add(id);
    this.unlockDates[id] = nowIso;
    this.saveToStorage();

    const enrichedItem: AchievementItem = {
      ...item,
      unlockedAt: nowIso,
    };

    if (!options?.silent) {
      audioFeedback.playAchievementFanfare();
      this.listeners.forEach((listener) => {
        try {
          listener(enrichedItem);
        } catch (err) {
          console.error('[Achievements] Listener error:', err);
        }
      });
    }

    // Verificar si se alcanzó el logro legendario final (200 logros)
    if (this.unlockedIds.size >= 199 && !this.unlockedIds.has('leg_25')) {
      setTimeout(() => {
        this.unlock('leg_25');
      }, 1000);
    }

    return true;
  }

  /**
   * Suscribirse a nuevos desbloqueos en tiempo real para mostrar toasts
   */
  public subscribe(listener: AchievementListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Estadísticas de progreso del jugador / trader
   */
  public getStats() {
    const total = ACHIEVEMENTS_DATA.length;
    const unlockedCount = this.unlockedIds.size;
    const percent = total > 0 ? Math.round((unlockedCount / total) * 100) : 0;

    let totalXp = 0;
    let earnedXp = 0;

    const byCategory: Record<
      AchievementCategory,
      { count: number; unlocked: number; name: string; icon: string }
    > = {
      academia: { count: 0, unlocked: 0, ...CATEGORY_METADATA.academia },
      riesgo: { count: 0, unlocked: 0, ...CATEGORY_METADATA.riesgo },
      ejecucion: { count: 0, unlocked: 0, ...CATEGORY_METADATA.ejecucion },
      rendimiento: { count: 0, unlocked: 0, ...CATEGORY_METADATA.rendimiento },
      multiactivo: { count: 0, unlocked: 0, ...CATEGORY_METADATA.multiactivo },
      ia_mentor: { count: 0, unlocked: 0, ...CATEGORY_METADATA.ia_mentor },
      disciplina: { count: 0, unlocked: 0, ...CATEGORY_METADATA.disciplina },
      legendario: { count: 0, unlocked: 0, ...CATEGORY_METADATA.legendario },
    };

    ACHIEVEMENTS_DATA.forEach((item) => {
      totalXp += item.xp;
      if (byCategory[item.category]) {
        byCategory[item.category].count += 1;
      }
      if (this.unlockedIds.has(item.id)) {
        earnedXp += item.xp;
        if (byCategory[item.category]) {
          byCategory[item.category].unlocked += 1;
        }
      }
    });

    // Calcular Rango Gamer / Trader basado en XP
    let rank = 'Cadete de Observación';
    if (earnedXp >= 6000) rank = 'Comandante Supremo Quant';
    else if (earnedXp >= 4000) rank = 'Capitán Algorítmico';
    else if (earnedXp >= 2500) rank = 'Estratega Cuántico';
    else if (earnedXp >= 1200) rank = 'Operador Táctico Pro';
    else if (earnedXp >= 500) rank = 'Piloto en Formación';
    else if (earnedXp >= 100) rank = 'Navegante Junior';

    return {
      total,
      unlockedCount,
      percent,
      totalXp,
      earnedXp,
      rank,
      byCategory,
    };
  }

  /**
   * Evalúa automáticamente métricas de trading del portafolio y posiciones
   */
  public evaluateTradingMilestones(portfolio?: any, openTrades: any[] = [], closedTrades: any[] = []) {
    // 1. Primer Vuelo / Iniciación
    this.unlock('acad_01');

    // 2. Primera orden abierta o cerrada
    if ((openTrades && openTrades.length > 0) || (closedTrades && closedTrades.length > 0)) {
      this.unlock('exec_01'); // Bautismo de Fuego
    }

    // 3. Órdenes con Stop Loss
    const hasProtectedTrade = [...openTrades, ...closedTrades].some(
      (t) => t.stop_loss || t.sl || (t.stop_loss_pct && t.stop_loss_pct > 0)
    );
    if (hasProtectedTrade) {
      this.unlock('risk_01'); // Escudo Inicial
    }

    // 4. Primer trade en ganancia
    const winningTrade = closedTrades.find((t) => (t.profit_abs && t.profit_abs > 0) || (t.profit_ratio && t.profit_ratio > 0));
    if (winningTrade) {
      this.unlock('pnl_01'); // Primer Pips Verde
    }

    // 5. Portafolio activo con balance
    if (portfolio && (portfolio.total_balance > 0 || portfolio.equity > 0)) {
      this.unlock('leg_01'); // Génesis Algorítmica
    }
  }

  /**
   * Desbloquea un lote de logros de demostración para testear o dar bienvenida
   */
  public unlockDemoBatch() {
    const demos = ['acad_02', 'acad_03', 'acad_07', 'risk_02', 'asset_01', 'zen_01'];
    demos.forEach((id, index) => {
      setTimeout(() => {
        this.unlock(id);
      }, index * 400);
    });
  }

  /**
   * Reinicia todos los logros (para pruebas o reset del usuario)
   */
  public resetAll() {
    this.unlockedIds = new Set(['acad_01']);
    this.unlockDates = { acad_01: new Date().toISOString() };
    this.saveToStorage();
  }
}

export const achievementsService = new AchievementsService();
