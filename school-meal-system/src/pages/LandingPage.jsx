import { Link } from "react-router-dom";
import {
  Utensils,
  Calendar,
  CreditCard,
  Star,
  ArrowRight,
  ChefHat,
  Users,
} from "lucide-react";
import ThemeToggle from "../components/layout/ThemeToggle";

const LandingPage = () => {
  const features = [
    {
      icon: <Utensils className="h-8 w-8" />,
      title: "Онлайн-меню",
      description: "Просматривайте ежедневное меню и выбирайте блюда заранее",
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Заказ еды",
      description: "Заказывайте завтраки и обеды в несколько кликов",
    },
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: "Удобная оплата",
      description: "Пополняйте баланс и отслеживайте расходы в личном кабинете",
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: "Отзывы и оценки",
      description: "Оставляйте отзывы о блюдах и делитесь мнением",
    },
    {
      icon: <ChefHat className="h-8 w-8" />,
      title: "Для поваров",
      description: "Управление заказами и заявками на закупку продуктов",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Для администраторов",
      description: "Полный контроль над меню, статистика и отчётность",
    },
  ];

  return (
    <div className="min-h-screen bg-lavender-blue-100">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-purple-800 to-lavender-blue-500 text-white">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="text-6xl mb-4">🍽️</div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                Школьная столовая
              </h1>
              <p className="text-xl lg:text-2xl mb-8 text-white/90">
                Современная система управления питанием для школьников, поваров
                и администраторов
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/register"
                  className="btn btn-primary btn-lg text-white border-none"
                >
                  Зарегистрироваться
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
                <Link
                  to="/login"
                  className="btn btn-outline btn-lg text-white border-white hover:bg-white hover:text-purple-800"
                >
                  Войти
                </Link>

                <ThemeToggle />
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
                <div className="text-9xl">👨‍🍳</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Возможности системы
            </h2>
            <p className="text-lg max-w-2xl mx-auto">
              Наша платформа предоставляет удобный инструмент для организации
              питания в школе
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="card-body items-center text-center">
                  <div className="text-primary mb-4">{feature.icon}</div>
                  <h3 className="card-title text-lg">{feature.title}</h3>
                  <p className="text-base-content/70">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-lavender-blue-500 to-purple-800 text-white py-16 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Готовы начать?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Присоединяйтесь к системе управления школьным питанием уже сегодня
          </p>
          <Link
            to="/register"
            className="btn btn-secondary btn-lg text-white border-none"
          >
            Создать аккаунт
            <ArrowRight className="h-5 w-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2026 Школьная столовая. Московская предпрофессиональная олимпиада
            школьников.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Профиль «Информационные технологии»
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
