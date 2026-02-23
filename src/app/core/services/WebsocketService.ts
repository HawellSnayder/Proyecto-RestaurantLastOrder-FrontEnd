import { Injectable, inject, PLATFORM_ID } from '@angular/core';
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
  private platformId = inject(PLATFORM_ID);

  private idDesactivadoSubject = new Subject<number>();
  private categoriaCambioSubject = new Subject<any>();
  private platoCambioSubject = new Subject<any>();
  private mesaEstadoSubject = new Subject<any>();
  private stockCambioSubject = new Subject<any>();
  private nuevoPedidoSubject = new Subject<any>();

  private stompClient!: Client;
  private subscriptions: StompSubscription[] = [];
  private conectado: boolean = false;

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
        this.conectado = true;
        this.suscribirCanales();
      },
      onDisconnect: () => {
        console.log('❌ Desconectado de WebSockets');
        this.conectado = false;
      },
      onStompError: (frame) => {
        console.error('❌ Broker error: ' + frame.headers['message']);
      }
    });

    this.stompClient.activate();
  }


  public watch(topic: string): Observable<any> {
    return new Observable(observer => {
      if (!isPlatformBrowser(this.platformId) || !this.stompClient) return;

      const intentarSuscripcion = () => {
        if (this.stompClient.connected) {
          const sub = this.stompClient.subscribe(topic, (message) => {
            observer.next(JSON.parse(message.body));
          });
          return sub;
        }
        return null;
      };

      let subscription = intentarSuscripcion();

      const interval = setInterval(() => {
        if (!subscription && this.stompClient.connected) {
          subscription = intentarSuscripcion();
          if (subscription) clearInterval(interval);
        }
      }, 500);

      return () => {
        if (subscription) subscription.unsubscribe();
        clearInterval(interval);
      };
    });
  }


  private suscribirCanales() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];

    const mesaSub = this.stompClient.subscribe('/topic/mesas', (message) => {
      this.mesaEstadoSubject.next(JSON.parse(message.body));
    });
    this.subscriptions.push(mesaSub);

    const stockSub = this.stompClient.subscribe('/topic/platos/disponibilidad', (message) => {
      this.stockCambioSubject.next(JSON.parse(message.body));
    });
    this.subscriptions.push(stockSub);

    const catSub = this.stompClient.subscribe('/topic/categorias', (message) => {
      this.categoriaCambioSubject.next(JSON.parse(message.body));
    });
    this.subscriptions.push(catSub);

    const platoSub = this.stompClient.subscribe('/topic/platos', (message) => {
      this.platoCambioSubject.next(JSON.parse(message.body));
    });
    this.subscriptions.push(platoSub);

    const pedidoSub = this.stompClient.subscribe('/topic/pedidos', (message) => {
      this.nuevoPedidoSubject.next(JSON.parse(message.body));
    });
    this.subscriptions.push(pedidoSub);

    const username = localStorage.getItem('username');
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


  getMesaCambios(): Observable<any> {
    return this.mesaEstadoSubject.asObservable();
  }

  getStockCambios(): Observable<any> {
    return this.stockCambioSubject.asObservable();
  }

  getCategoriaCambios(): Observable<any> {
    return this.categoriaCambioSubject.asObservable();
  }

  getPlatoCambios(): Observable<any> {
    return this.platoCambioSubject.asObservable();
  }

  getNuevoPedidoNotificacion(): Observable<any> {
    return this.nuevoPedidoSubject.asObservable();
  }

  getDesactivaciones(): Observable<number> {
    return this.idDesactivadoSubject.asObservable();
  }

  actualizarSuscripcionesPostLogin() {
    if (this.stompClient && this.stompClient.connected) {
      this.suscribirCanales();
    }
  }
  getPedidoCambios(): Observable<any> {
    return this.nuevoPedidoSubject.asObservable();
  }

  private forzarLogout(mensaje: string) {
    alert(mensaje || 'Tu cuenta ha sido desactivada.');
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
