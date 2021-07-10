
# include <Siv3D.hpp> // OpenSiv3D v0.4.3

#include "GuiSolver.h"

void Main()
{
	// 背景を水色にする
	Scene::SetBackground(ColorF(0.8, 0.9, 1.0));

	GuiSolver solver;
	Window::Resize(Size(1080, 800));

	while (System::Update())
	{
		solver.update();
		// ボタンが押されたら
		if (SimpleGUI::Button(U"Read Input", Vec2(800, 20)))
		{
			if (auto file = Dialog::OpenFile({ FileFilter::JSON() })) {
				solver = GuiSolver(*file);
			}
		}
		if (SimpleGUI::Button(U"Read Solution", Vec2(800, 100)))
		{
			if (auto file = Dialog::OpenFile({ FileFilter::JSON() })) {
				solver.readSolution(*file);
			}
		}
		if (SimpleGUI::Button(U"Write Solution", Vec2(800, 180)))
		{
			if (auto file = Dialog::SaveFile({ FileFilter::JSON() })) {
				solver.write(*file);
			}
		}
	}
}

//
// = アドバイス =
// Debug ビルドではプログラムの最適化がオフになります。
// 実行速度が遅いと感じた場合は Release ビルドを試しましょう。
// アプリをリリースするときにも、Release ビルドにするのを忘れないように！
//
// 思ったように動作しない場合は「デバッグの開始」でプログラムを実行すると、
// 出力ウィンドウに詳細なログが表示されるので、エラーの原因を見つけやすくなります。
//
// = お役立ちリンク =
//
// OpenSiv3D リファレンス
// https://siv3d.github.io/ja-jp/
//
// チュートリアル
// https://siv3d.github.io/ja-jp/tutorial/basic/
//
// よくある間違い
// https://siv3d.github.io/ja-jp/articles/mistakes/
//
// サポートについて
// https://siv3d.github.io/ja-jp/support/support/
//
// Siv3D ユーザコミュニティ Slack への参加
// https://siv3d.github.io/ja-jp/community/community/
//
// 新機能の提案やバグの報告
// https://github.com/Siv3D/OpenSiv3D/issues
//
