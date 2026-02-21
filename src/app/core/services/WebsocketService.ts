import { Injectable, inject, PLATFORM_ID, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Observable } from 'rxjs';
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private router = inject(Router);
  private idDesactivadoSubject = new Subject<number>();
  private categoriaCambioSubject = new Subject<any>();
  private platoCambioSubject = new Subject<any>(); // Declarado correctamente

  private stompClient!: Client;
  private platformId = inject(PLATFORM_ID);
  private subscriptions: StompSubscription[] = [];

  public watch(topic: string) {
    return new Observable(observer => {
      const subscription = this.stompClient.subscribe(topic, (message: any) => {
        observer.next(JSON.parse(message.body));
      });
      return () => subscription.unsubscribe();
    });
  }

  constructor() {
    this.configurarConexion();
  }

  private configurarConexion() {
    if (!isPlatformBrowser(this.platformId)) return;

    const socket = new SockJS('http://localhost:9090/ws-repro');

    this.stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('✅ Conectado al servidor de WebSockets');
        this.suscribirCanales();
      },
      onStompError: (frame) => {
        console.error('❌ Broker error: ' + frame.headers['message']);
      }
    });

    this.stompClient.activate();
  }

  private suscribirCanales() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];

    const username = localStorage.getItem('username');

    // 1. CANAL DE CATEGORÍAS
    const catSub = this.stompClient.subscribe('/topic/categorias', (message) => {
      try {
        const eventoDto = JSON.parse(message.body);
        this.categoriaCambioSubject.next(eventoDto);
      } catch (e) {
        console.error('Error parseando JSON de categoría', e);
      }
    });
    this.subscriptions.push(catSub);

    // 2. CANAL DE PLATOS (Lo sacamos del IF para que funcione siempre)
    const platoSub = this.stompClient.subscribe('/topic/platos', (message) => {
      try {
        const eventoPlato = JSON.parse(message.body);
        console.log('🍽️ Socket Plato:', eventoPlato);
        this.platoCambioSubject.next(eventoPlato);
      } catch (e) {
        console.error('Error parseando JSON de plato', e);
      }
    });
    this.subscriptions.push(platoSub);

    // 3. CANALES PRIVADOS (Solo con login)
    if (username) {
      const logoutSub = this.stompClient.subscribe(`/topic/logout/${username}`, (message) => {
        this.forzarLogout(message.body);
      });
      this.subscriptions.push(logoutSub);

      const userSub = this.stompClient.subscribe('/topic/usuarios-desactivados', (message) => {
        this.idDesactivadoSubject.next(Number(message.body));
      });
      this.subscriptions.push(userSub);
    }
  }

  // --- MÉTODOS PARA COMPONENTES (Aquí faltaba el de platos) ---

  getDesactivaciones(): Observable<number> {
    return this.idDesactivadoSubject.asObservable();
  }

  getCategoriaCambios(): Observable<any> {
    return this.categoriaCambioSubject.asObservable();
  }

  // ESTE ES EL QUE TE DABA EL ERROR TS2339 🔥
  getPlatoCambios(): Observable<any> {
    return this.platoCambioSubject.asObservable();
  }

  actualizarSuscripcionesPostLogin() {
    if (this.stompClient && this.stompClient.connected) {
      this.suscribirCanales();
    }
  }

  private forzarLogout(mensaje: string) {
    alert(mensaje || 'Tu cuenta ha sido desactivada.');
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
